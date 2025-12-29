import Foundation
import UIKit
import Combine

// MARK: - Image Gallery App with UI Thread Violations

class ImageGalleryViewController: UIViewController {
    
    @IBOutlet var collectionView: UICollectionView!
    @IBOutlet var loadingIndicator: UIActivityIndicatorView!
    @IBOutlet var statusLabel: UILabel!
    @IBOutlet var progressBar: UIProgressView!
    
    private var images: [UIImage] = []
    private var imageURLs: [URL] = []
    private let imageService = ImageService()
    private var cancellables = Set<AnyCancellable>()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCollectionView()
        loadImages()
    }
    
    func setupCollectionView() {
        collectionView.dataSource = self
        collectionView.delegate = self
    }
    
    // MARK: - Synchronous Loading
    
    func loadImages() {
        loadingIndicator.startAnimating()
        let urls = imageService.fetchImageURLsSync()
        imageURLs = urls
        for url in urls {
            if let data = try? Data(contentsOf: url),  // Blocking I/O on main thread
               let image = UIImage(data: data) {
                images.append(image)
            }
        }
        
        loadingIndicator.stopAnimating()
        collectionView.reloadData()
    }
    
    // MARK: - Async Loading
    
    func loadImagesAsync() {
        loadingIndicator.startAnimating()
        
        DispatchQueue.global(qos: .background).async {
            let urls = self.imageService.fetchImageURLsSync()
            self.imageURLs = urls
            
            for (index, url) in urls.enumerated() {
                if let data = try? Data(contentsOf: url),
                   let image = UIImage(data: data) {
                    self.images.append(image)
                    self.collectionView.reloadData()
                    self.statusLabel.text = "Loaded \(index + 1) of \(urls.count)"
                    self.progressBar.progress = Float(index + 1) / Float(urls.count)
                }
            }
            self.loadingIndicator.stopAnimating()
        }
    }
    
    // MARK: - Partial Threading
    
    func loadImagesWithPartialFix() {
        DispatchQueue.global().async {
            let urls = self.imageService.fetchImageURLsSync()
            
            for url in urls {
                if let data = try? Data(contentsOf: url),
                   let image = UIImage(data: data) {
                    self.images.append(image)  // Race condition - not thread safe
                    
                    DispatchQueue.main.async {
                        self.collectionView.reloadData()
                    }
                }
            }
        }
    }
    
    // MARK: - Error Handling
    
    func showErrorAlert(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)  // Called from background thread
    }
    
    func fetchWithError() {
        DispatchQueue.global().async {
            do {
                _ = try self.imageService.fetchWithError()
            } catch {
                self.showErrorAlert(error.localizedDescription)
            }
        }
    }
    
    // MARK: - Navigation
    
    func navigateToDetail(for image: UIImage) {
        DispatchQueue.global().async {
            // Some background processing...
            Thread.sleep(forTimeInterval: 0.5)
            let detailVC = ImageDetailViewController()
            detailVC.image = image
            self.navigationController?.pushViewController(detailVC, animated: true)
        }
    }
    
    // MARK: - Animations
    
    func animateLoadingComplete() {
        DispatchQueue.global().async {
            UIView.animate(withDuration: 0.3) {
                self.loadingIndicator.alpha = 0
            }
            self.statusLabel.isHidden = false
            self.progressBar.isHidden = true
        }
    }
}

// MARK: - Collection View Data Source

extension ImageGalleryViewController: UICollectionViewDataSource, UICollectionViewDelegate {
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return images.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "ImageCell", for: indexPath) as! ImageCell
        let image = images[indexPath.item]
        cell.imageView.image = applyFilterSync(to: image)  // Blocking call
        
        return cell
    }
    func applyFilterSync(to image: UIImage) -> UIImage {
        // Simulates expensive image processing
        Thread.sleep(forTimeInterval: 0.1)  // Blocks main thread
        return image
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let image = images[indexPath.item]
        let processedImage = processImageSync(image)
        navigateToDetail(for: processedImage)
    }
    
    func processImageSync(_ image: UIImage) -> UIImage {
        Thread.sleep(forTimeInterval: 1.0)
        return image
    }
}

// MARK: - Image Cell

class ImageCell: UICollectionViewCell {
    @IBOutlet var imageView: UIImageView!
    @IBOutlet var titleLabel: UILabel!
}

// MARK: - Image Service

class ImageService {
    func fetchImageURLsSync() -> [URL] {
        // Simulates slow network call
        Thread.sleep(forTimeInterval: 2.0)
        return [
            URL(string: "https://example.com/image1.jpg")!,
            URL(string: "https://example.com/image2.jpg")!,
            URL(string: "https://example.com/image3.jpg")!
        ]
    }
    
    func fetchWithError() throws -> [URL] {
        Thread.sleep(forTimeInterval: 1.0)
        throw NSError(domain: "ImageService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Server error"])
    }
    func fetchImageURLsAsync(completion: @escaping ([URL]) -> Void) {
        DispatchQueue.global().async {
            Thread.sleep(forTimeInterval: 1.0)
            let urls = [
                URL(string: "https://example.com/image1.jpg")!,
                URL(string: "https://example.com/image2.jpg")!
            ]
            completion(urls)  // Caller might update UI directly
        }
    }
}

// MARK: - Image Detail View Controller

class ImageDetailViewController: UIViewController {
    
    var image: UIImage?
    @IBOutlet var imageView: UIImageView!
    @IBOutlet var filterButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        imageView.image = image
    }
    
    @IBAction func applyFilterTapped(_ sender: Any) {
        guard let image = image else { return }
        
        // Disables button but processing still blocks
        filterButton.isEnabled = false
        let filtered = applyComplexFilter(to: image)
        
        // UI never updates until processing complete
        imageView.image = filtered
        filterButton.isEnabled = true
    }
    
    func applyComplexFilter(to image: UIImage) -> UIImage {
        // Simulates heavy image processing
        Thread.sleep(forTimeInterval: 3.0)  // Blocks main thread for 3 seconds
        return image
    }
    func applyFilterAsync() {
        guard let image = image else { return }
        
        DispatchQueue.global().async {
            let filtered = self.applyComplexFilter(to: image)
            self.imageView.image = filtered
        }
    }
}

// MARK: - Upload Manager with Threading Issues

class UploadManager {
    
    static let shared = UploadManager()
    weak var delegate: UploadDelegate?
    
    private var uploadProgress: Float = 0
    
    func uploadImages(_ images: [UIImage]) {
        DispatchQueue.global().async {
            for (index, image) in images.enumerated() {
                // Simulate upload
                Thread.sleep(forTimeInterval: 0.5)
                
                self.uploadProgress = Float(index + 1) / Float(images.count)
                self.delegate?.uploadProgressUpdated(self.uploadProgress)
            }
            self.delegate?.uploadCompleted()
        }
    }
}

protocol UploadDelegate: AnyObject {
    func uploadProgressUpdated(_ progress: Float)
    func uploadCompleted()
}

// MARK: - Settings Screen with Disk I/O Issues

class SettingsViewController: UIViewController {
    
    @IBOutlet var saveButton: UIButton!
    
    @IBAction func saveTapped(_ sender: Any) {
        let settings = collectSettings()
        let data = try! JSONEncoder().encode(settings)
        let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("settings.json")
        
        // Blocking write on main thread
        try! data.write(to: url)
        
        showSaveConfirmation()
    }
    
    func collectSettings() -> [String: Any] {
        return ["theme": "dark", "notifications": true]
    }
    
    func showSaveConfirmation() {
        let alert = UIAlertController(title: "Saved", message: "Settings saved successfully", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    func loadSettings() {
        let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("settings.json")
        
        if let data = try? Data(contentsOf: url) {  // Blocking read
            let settings = try? JSONDecoder().decode([String: String].self, from: data)
            applySettings(settings ?? [:])
        }
    }
    
    func applySettings(_ settings: [String: String]) {
        // Apply settings to UI
    }
}

// MARK: - Database Manager with Thread Safety Issues

class DatabaseManager {
    
    static let shared = DatabaseManager()
    private var cache: [String: Any] = [:]
    
    func saveToCache(_ value: Any, forKey key: String) {
        cache[key] = value
    }
    
    func getFromCache(forKey key: String) -> Any? {
        return cache[key]
    }
    
    func fetchAndCache(id: String, completion: @escaping (Any?) -> Void) {
        DispatchQueue.global().async {
            // Simulate database fetch
            Thread.sleep(forTimeInterval: 0.2)
            let data = ["id": id, "name": "Test"]
            self.cache[id] = data
            completion(data)
        }
    }
    
    func clearCacheAsync() {
        DispatchQueue.global().async {
            self.cache.removeAll()
        }
    }
}

// MARK: - Combine Publisher Issues

class ImageSearchViewModel: ObservableObject {
    
    @Published var searchResults: [UIImage] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    func search(query: String) {
        isLoading = true
        URLSession.shared.dataTaskPublisher(for: URL(string: "https://api.example.com/search?q=\(query)")!)
            .map { $0.data }
            .decode(type: [String].self, decoder: JSONDecoder())
            .sink(
                receiveCompletion: { completion in
                    self.isLoading = false
                    if case .failure(let error) = completion {
                        self.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { urls in
                    self.searchResults = urls.compactMap { _ in UIImage() }
                }
            )
            .store(in: &cancellables)
    }
}

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
    
    // MARK: - Bug: Blocking Main Thread
    
    func loadImages() {
        loadingIndicator.startAnimating()
        
        // BUG: Synchronous network call on main thread - causes UI freeze
        let urls = imageService.fetchImageURLsSync()
        imageURLs = urls
        
        // BUG: Processing images synchronously on main thread
        for url in urls {
            if let data = try? Data(contentsOf: url),  // Blocking I/O on main thread
               let image = UIImage(data: data) {
                images.append(image)
            }
        }
        
        loadingIndicator.stopAnimating()
        collectionView.reloadData()
    }
    
    // MARK: - Bug: UI Updates from Background Thread
    
    func loadImagesAsync() {
        loadingIndicator.startAnimating()
        
        DispatchQueue.global(qos: .background).async {
            let urls = self.imageService.fetchImageURLsSync()
            self.imageURLs = urls
            
            for (index, url) in urls.enumerated() {
                if let data = try? Data(contentsOf: url),
                   let image = UIImage(data: data) {
                    self.images.append(image)
                    
                    // BUG: Updating UI from background thread
                    self.collectionView.reloadData()
                    self.statusLabel.text = "Loaded \(index + 1) of \(urls.count)"
                    self.progressBar.progress = Float(index + 1) / Float(urls.count)
                }
            }
            
            // BUG: Stopping indicator from background thread
            self.loadingIndicator.stopAnimating()
        }
    }
    
    // MARK: - Bug: Mixed Threading with Partial Fix
    
    func loadImagesWithPartialFix() {
        DispatchQueue.global().async {
            let urls = self.imageService.fetchImageURLsSync()
            
            for url in urls {
                if let data = try? Data(contentsOf: url),
                   let image = UIImage(data: data) {
                    
                    // BUG: Only partial dispatch - array modification still on background
                    self.images.append(image)  // Race condition - not thread safe
                    
                    DispatchQueue.main.async {
                        self.collectionView.reloadData()
                    }
                }
            }
        }
    }
    
    // MARK: - Bug: Alert on Background Thread
    
    func showErrorAlert(_ message: String) {
        // BUG: Presenting alert from background thread
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)  // Called from background thread
    }
    
    func fetchWithError() {
        DispatchQueue.global().async {
            do {
                _ = try self.imageService.fetchWithError()
            } catch {
                // BUG: Showing alert from background thread
                self.showErrorAlert(error.localizedDescription)
            }
        }
    }
    
    // MARK: - Bug: Navigation from Background Thread
    
    func navigateToDetail(for image: UIImage) {
        DispatchQueue.global().async {
            // Some background processing...
            Thread.sleep(forTimeInterval: 0.5)
            
            // BUG: Navigation from background thread
            let detailVC = ImageDetailViewController()
            detailVC.image = image
            self.navigationController?.pushViewController(detailVC, animated: true)
        }
    }
    
    // MARK: - Bug: Animation on Background Thread
    
    func animateLoadingComplete() {
        DispatchQueue.global().async {
            // BUG: UIView animation from background thread
            UIView.animate(withDuration: 0.3) {
                self.loadingIndicator.alpha = 0
            }
            
            // BUG: Setting view properties from background thread
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
        
        // BUG: Loading image synchronously in cellForItem - causes scroll jank
        let image = images[indexPath.item]
        cell.imageView.image = applyFilterSync(to: image)  // Blocking call
        
        return cell
    }
    
    // BUG: Expensive synchronous operation
    func applyFilterSync(to image: UIImage) -> UIImage {
        // Simulates expensive image processing
        Thread.sleep(forTimeInterval: 0.1)  // Blocks main thread
        return image
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let image = images[indexPath.item]
        
        // BUG: Heavy processing on main thread during selection
        let processedImage = processImageSync(image)
        navigateToDetail(for: processedImage)
    }
    
    func processImageSync(_ image: UIImage) -> UIImage {
        // BUG: Blocks main thread
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
    
    // BUG: Designed for main thread use but blocks
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
    
    // BUG: Callback on wrong thread
    func fetchImageURLsAsync(completion: @escaping ([URL]) -> Void) {
        DispatchQueue.global().async {
            Thread.sleep(forTimeInterval: 1.0)
            let urls = [
                URL(string: "https://example.com/image1.jpg")!,
                URL(string: "https://example.com/image2.jpg")!
            ]
            // BUG: Completion called on background thread
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
        // BUG: Heavy processing blocks UI
        guard let image = image else { return }
        
        // Disables button but processing still blocks
        filterButton.isEnabled = false
        
        // BUG: Synchronous heavy processing
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
    
    // BUG: Async filter with wrong thread callback
    func applyFilterAsync() {
        guard let image = image else { return }
        
        DispatchQueue.global().async {
            let filtered = self.applyComplexFilter(to: image)
            
            // BUG: Updating imageView from background thread
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
                
                // BUG: Delegate callback from background thread
                self.delegate?.uploadProgressUpdated(self.uploadProgress)
            }
            
            // BUG: Completion callback from background thread
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
        // BUG: Synchronous file I/O on main thread
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
        // BUG: Synchronous file read on main thread
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
    
    // BUG: Mutable state accessed from multiple threads without synchronization
    private var cache: [String: Any] = [:]
    
    func saveToCache(_ value: Any, forKey key: String) {
        // BUG: Not thread-safe
        cache[key] = value
    }
    
    func getFromCache(forKey key: String) -> Any? {
        // BUG: Not thread-safe
        return cache[key]
    }
    
    func fetchAndCache(id: String, completion: @escaping (Any?) -> Void) {
        DispatchQueue.global().async {
            // Simulate database fetch
            Thread.sleep(forTimeInterval: 0.2)
            let data = ["id": id, "name": "Test"]
            
            // BUG: Modifying shared state from background thread
            self.cache[id] = data
            
            // BUG: Completion might be used for UI update
            completion(data)
        }
    }
    
    func clearCacheAsync() {
        DispatchQueue.global().async {
            // BUG: Dictionary modification not thread-safe
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
        
        // BUG: Publisher doesn't receive on main thread
        URLSession.shared.dataTaskPublisher(for: URL(string: "https://api.example.com/search?q=\(query)")!)
            .map { $0.data }
            .decode(type: [String].self, decoder: JSONDecoder())
            // BUG: Missing .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    // BUG: @Published update from background thread
                    self.isLoading = false
                    if case .failure(let error) = completion {
                        self.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { urls in
                    // BUG: @Published update from background thread
                    self.searchResults = urls.compactMap { _ in UIImage() }
                }
            )
            .store(in: &cancellables)
    }
}

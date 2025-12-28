import Foundation
import UIKit

// MARK: - Models

struct User {
    let id: String
    var name: String?
    var email: String?
    var profileImageURL: String?
    var settings: UserSettings?
    var friends: [User]?
    var lastLogin: Date?
}

struct UserSettings {
    var notificationsEnabled: Bool?
    var theme: String?
    var language: String?
    var privacyLevel: Int?
}

struct APIResponse<T> {
    var data: T?
    var error: String?
    var metadata: [String: Any]?
}

// MARK: - Network Service

class UserService {
    static let shared = UserService()
    
    private var cachedUser: User?
    private var authToken: String?
    
    // BUG: Force unwrapping optional that might be nil
    func getCurrentUser() -> User {
        return cachedUser!  // Crashes if user not logged in
    }
    
    // BUG: Implicitly unwrapped optional never assigned
    var currentUserId: String!
    
    func fetchUser(id: String, completion: @escaping (APIResponse<User>) -> Void) {
        // Simulate network call
        DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
            let response = APIResponse<User>(data: nil, error: "User not found")
            completion(response)
        }
    }
    
    func login(email: String, password: String) {
        // BUG: Token might not be set if login fails
        // but we force unwrap it later
        if email == "test@example.com" {
            authToken = "valid_token"
            cachedUser = User(id: "1", name: "Test User")
        }
        // authToken remains nil for invalid credentials
    }
    
    // BUG: Force unwrapping authToken that might be nil
    func getAuthHeader() -> String {
        return "Bearer \(authToken!)"  // Crashes if not logged in
    }
}

// MARK: - View Controllers

class ProfileViewController: UIViewController {
    
    // BUG: IBOutlet force unwrapped but might not be connected
    @IBOutlet var nameLabel: UILabel!
    @IBOutlet var emailLabel: UILabel!
    @IBOutlet var profileImageView: UIImageView!
    
    // BUG: Implicitly unwrapped optional assumed to be set
    var userId: String!
    
    private var user: User?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // BUG: Force unwrapping userId that might not be set
        loadUser(id: userId!)  // Crashes if userId not set by presenting VC
    }
    
    func loadUser(id: String) {
        UserService.shared.fetchUser(id: id) { [weak self] response in
            // BUG: Force unwrapping response.data without checking
            let user = response.data!  // Crashes if API returns error
            
            self?.user = user
            self?.updateUI()
        }
    }
    
    func updateUI() {
        // BUG: Force unwrapping optional properties
        nameLabel.text = user!.name!  // Double crash risk
        emailLabel.text = user!.email!
        
        // BUG: Force unwrapping URL string and creating URL
        let imageURL = URL(string: user!.profileImageURL!)!
        loadImage(from: imageURL)
    }
    
    func loadImage(from url: URL) {
        // Image loading implementation
    }
    
    // BUG: Array subscript without bounds checking
    func getFriendName(at index: Int) -> String {
        return user!.friends![index].name!  // Triple crash risk
    }
    
    // BUG: Dictionary subscript force cast
    func getMetadata(key: String) -> String {
        let metadata = user?.settings as? [String: Any]
        return metadata![key] as! String  // Crashes on missing key or wrong type
    }
}

// MARK: - Settings Screen

class SettingsViewController: UIViewController {
    
    var settings: UserSettings?
    
    // BUG: Force unwrapping settings that might be nil
    func getNotificationStatus() -> Bool {
        return settings!.notificationsEnabled!
    }
    
    // BUG: Chained force unwrapping
    func getThemeUppercased() -> String {
        return settings!.theme!.uppercased()
    }
    
    // BUG: Force try without do-catch
    func loadSettingsFromFile() {
        let path = Bundle.main.path(forResource: "settings", ofType: "json")!
        let data = try! Data(contentsOf: URL(fileURLWithPath: path))
        let json = try! JSONSerialization.jsonObject(with: data)
        print(json)
    }
    
    // BUG: as! force cast that might fail
    func parsePrivacyLevel(from value: Any) -> Int {
        return value as! Int  // Crashes if value is String "3" instead of Int 3
    }
}

// MARK: - Friends List

class FriendsViewController: UIViewController, UITableViewDataSource {
    
    var friends: [User]?
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // BUG: Force unwrapping optional array
        return friends!.count  // Crashes if friends is nil
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "FriendCell", for: indexPath)
        
        // BUG: Force unwrapping array and properties
        let friend = friends![indexPath.row]
        cell.textLabel!.text = friend.name!
        cell.detailTextLabel!.text = friend.email!
        
        return cell
    }
    
    // BUG: first! on potentially empty array
    func getFirstFriend() -> User {
        return friends!.first!  // Crashes if array empty
    }
    
    // BUG: last! on potentially empty array  
    func getLastFriend() -> User {
        return friends!.last!
    }
    
    // BUG: reduce with force unwrap inside closure
    func getTotalFriendsCharacters() -> Int {
        return friends!.reduce(0) { $0 + $1.name!.count }
    }
}

// MARK: - Login Flow

class LoginViewController: UIViewController {
    
    @IBOutlet var emailTextField: UITextField!
    @IBOutlet var passwordTextField: UITextField!
    
    @IBAction func loginTapped(_ sender: Any) {
        // BUG: Force unwrapping text fields that might be empty
        let email = emailTextField.text!
        let password = passwordTextField.text!
        
        UserService.shared.login(email: email, password: password)
        
        // BUG: Immediately using currentUserId that might not be set
        navigateToProfile(userId: UserService.shared.currentUserId!)
    }
    
    func navigateToProfile(userId: String) {
        let profileVC = ProfileViewController()
        profileVC.userId = userId
        navigationController?.pushViewController(profileVC, animated: true)
    }
    
    // BUG: Unowned reference that might become nil
    func setupKeyboardDismissal() {
        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tap)
    }
    
    @objc func dismissKeyboard() {
        view.endEditing(true)
    }
}

// MARK: - Date Handling

class DateHelper {
    
    // BUG: Force unwrapping DateFormatter result
    func parseDate(from string: String) -> Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: string)!  // Crashes on invalid format
    }
    
    // BUG: Force unwrapping Calendar components
    func getYear(from date: Date?) -> Int {
        let components = Calendar.current.dateComponents([.year], from: date!)
        return components.year!
    }
    
    // BUG: Force unwrapping time interval calculation
    func daysSinceLogin(user: User) -> Int {
        let interval = Date().timeIntervalSince(user.lastLogin!)
        return Int(interval / 86400)
    }
}

// MARK: - JSON Parsing

class JSONParser {
    
    // BUG: Force casting JSON without validation
    func parseUserFromJSON(_ json: [String: Any]) -> User {
        let id = json["id"] as! String
        let name = json["name"] as! String  // Might be NSNull or missing
        let email = json["email"] as! String
        
        // BUG: Nested force casts
        let settingsJSON = json["settings"] as! [String: Any]
        let theme = settingsJSON["theme"] as! String
        
        return User(
            id: id,
            name: name,
            email: email,
            settings: UserSettings(theme: theme)
        )
    }
    
    // BUG: Subscript and force cast chain
    func getNestedValue(_ json: [String: Any], path: [String]) -> String {
        var current: Any = json
        for key in path {
            current = (current as! [String: Any])[key]!
        }
        return current as! String
    }
}

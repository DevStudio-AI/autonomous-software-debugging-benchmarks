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
    func getCurrentUser() -> User {
        return cachedUser!  // Crashes if user not logged in
    }
    var currentUserId: String!
    
    func fetchUser(id: String, completion: @escaping (APIResponse<User>) -> Void) {
        // Simulate network call
        DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
            let response = APIResponse<User>(data: nil, error: "User not found")
            completion(response)
        }
    }
    
    func login(email: String, password: String) {
        // but we force unwrap it later
        if email == "test@example.com" {
            authToken = "valid_token"
            cachedUser = User(id: "1", name: "Test User")
        }
        // authToken remains nil for invalid credentials
    }
    func getAuthHeader() -> String {
        return "Bearer \(authToken!)"  // Crashes if not logged in
    }
}

// MARK: - View Controllers

class ProfileViewController: UIViewController {
    @IBOutlet var nameLabel: UILabel!
    @IBOutlet var emailLabel: UILabel!
    @IBOutlet var profileImageView: UIImageView!
    var userId: String!
    
    private var user: User?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        loadUser(id: userId!)  // Crashes if userId not set by presenting VC
    }
    
    func loadUser(id: String) {
        UserService.shared.fetchUser(id: id) { [weak self] response in
            let user = response.data!  // Crashes if API returns error
            
            self?.user = user
            self?.updateUI()
        }
    }
    
    func updateUI() {
        nameLabel.text = user!.name!  // Double crash risk
        emailLabel.text = user!.email!
        let imageURL = URL(string: user!.profileImageURL!)!
        loadImage(from: imageURL)
    }
    
    func loadImage(from url: URL) {
        // Image loading implementation
    }
    func getFriendName(at index: Int) -> String {
        return user!.friends![index].name!  // Triple crash risk
    }
    func getMetadata(key: String) -> String {
        let metadata = user?.settings as? [String: Any]
        return metadata![key] as! String  // Crashes on missing key or wrong type
    }
}

// MARK: - Settings Screen

class SettingsViewController: UIViewController {
    
    var settings: UserSettings?
    func getNotificationStatus() -> Bool {
        return settings!.notificationsEnabled!
    }
    func getThemeUppercased() -> String {
        return settings!.theme!.uppercased()
    }
    func loadSettingsFromFile() {
        let path = Bundle.main.path(forResource: "settings", ofType: "json")!
        let data = try! Data(contentsOf: URL(fileURLWithPath: path))
        let json = try! JSONSerialization.jsonObject(with: data)
        print(json)
    }
    func parsePrivacyLevel(from value: Any) -> Int {
        return value as! Int  // Crashes if value is String "3" instead of Int 3
    }
}

// MARK: - Friends List

class FriendsViewController: UIViewController, UITableViewDataSource {
    
    var friends: [User]?
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return friends!.count  // Crashes if friends is nil
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "FriendCell", for: indexPath)
        let friend = friends![indexPath.row]
        cell.textLabel!.text = friend.name!
        cell.detailTextLabel!.text = friend.email!
        
        return cell
    }
    func getFirstFriend() -> User {
        return friends!.first!  // Crashes if array empty
    }
    func getLastFriend() -> User {
        return friends!.last!
    }
    func getTotalFriendsCharacters() -> Int {
        return friends!.reduce(0) { $0 + $1.name!.count }
    }
}

// MARK: - Login Flow

class LoginViewController: UIViewController {
    
    @IBOutlet var emailTextField: UITextField!
    @IBOutlet var passwordTextField: UITextField!
    
    @IBAction func loginTapped(_ sender: Any) {
        let email = emailTextField.text!
        let password = passwordTextField.text!
        
        UserService.shared.login(email: email, password: password)
        navigateToProfile(userId: UserService.shared.currentUserId!)
    }
    
    func navigateToProfile(userId: String) {
        let profileVC = ProfileViewController()
        profileVC.userId = userId
        navigationController?.pushViewController(profileVC, animated: true)
    }
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
    func parseDate(from string: String) -> Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: string)!  // Crashes on invalid format
    }
    func getYear(from date: Date?) -> Int {
        let components = Calendar.current.dateComponents([.year], from: date!)
        return components.year!
    }
    func daysSinceLogin(user: User) -> Int {
        let interval = Date().timeIntervalSince(user.lastLogin!)
        return Int(interval / 86400)
    }
}

// MARK: - JSON Parsing

class JSONParser {
    func parseUserFromJSON(_ json: [String: Any]) -> User {
        let id = json["id"] as! String
        let name = json["name"] as! String  // Might be NSNull or missing
        let email = json["email"] as! String
        let settingsJSON = json["settings"] as! [String: Any]
        let theme = settingsJSON["theme"] as! String
        
        return User(
            id: id,
            name: name,
            email: email,
            settings: UserSettings(theme: theme)
        )
    }
    func getNestedValue(_ json: [String: Any], path: [String]) -> String {
        var current: Any = json
        for key in path {
            current = (current as! [String: Any])[key]!
        }
        return current as! String
    }
}

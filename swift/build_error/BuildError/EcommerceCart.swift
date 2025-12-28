import Foundation
import UIKit
import Combine

// MARK: - Models with Compilation Errors

// ERROR: Missing required protocol conformance
struct Product {  // Should be: Codable, Hashable
    let id: UUID
    let name: String
    let price: Decimal
    let category: ProductCategory
    var quantity: Int
}

// ERROR: Raw value type mismatch
enum ProductCategory: Int {  // Claims Int but uses String values
    case electronics = "electronics"
    case clothing = "clothing"
    case food = "food"
}

// ERROR: Struct with class-only protocol
struct CartItem: AnyObject {  // AnyObject is class-only
    var product: Product
    var quantity: Int
}

// ERROR: Protocol with missing associated type
protocol Repository {
    associatedtype Entity
    func save(_ entity: Entity)
    func findById(_ id: UUID) -> Entity  // Should return Entity?
}

// MARK: - Generic Errors

class DataStore<T> {
    private var items: [T] = []
    
    // ERROR: Generic constraint not satisfied
    func sortItems() -> [T] {
        return items.sorted()  // T doesn't conform to Comparable
    }
    
    // ERROR: Type mismatch in return
    func getFirst() -> String {
        return items.first  // Returns T?, not String
    }
    
    // ERROR: Cannot convert between generic types
    func merge(with other: DataStore<Any>) {
        items.append(contentsOf: other.items)  // [Any] != [T]
    }
}

// MARK: - Protocol Conformance Errors

// ERROR: Incomplete protocol conformance
class ProductRepository: Repository {
    // Missing: typealias Entity = Product
    // Missing: func findById(_ id: UUID) -> Product
    
    func save(_ entity: Product) {
        print("Saving product")
    }
}

// ERROR: Protocol requirement type mismatch
protocol Discountable {
    var discountPercent: Double { get }
    func applyDiscount(to price: Decimal) -> Decimal
}

extension Product: Discountable {
    // ERROR: Wrong return type
    var discountPercent: Int {  // Should be Double
        return 10
    }
    
    // ERROR: Wrong parameter type  
    func applyDiscount(to price: Double) -> Decimal {  // Should be Decimal
        return Decimal(price) * 0.9
    }
}

// MARK: - Closure and Escaping Errors

class NetworkManager {
    // ERROR: Non-escaping parameter used in escaping context
    func fetch(completion: (Data) -> Void) {
        DispatchQueue.global().async {
            completion(Data())  // completion escapes
        }
    }
    
    // ERROR: Escaping closure capturing mutating self
    struct RequestBuilder {
        var headers: [String: String] = [:]
        
        mutating func addHeader(_ key: String, _ value: String, then: @escaping () -> Void) {
            headers[key] = value
            DispatchQueue.main.async {
                then()  // Escaping closure captures mutating self
            }
        }
    }
}

// MARK: - Property Wrapper Errors

// ERROR: Property wrapper with wrong wrapped value type
@propertyWrapper
struct Clamped {
    var wrappedValue: Int
    
    init(wrappedValue: Int) {
        self.wrappedValue = max(0, min(100, wrappedValue))
    }
}

struct Settings {
    // ERROR: Using Int wrapper for Double property
    @Clamped var volume: Double  // Wrapper expects Int
    
    // ERROR: Using Int wrapper for String
    @Clamped var username: String  // Wrapper expects Int
}

// MARK: - Access Control Errors

public class Cart {
    // ERROR: Private property accessed from public method
    private var items: [Product] = []
    
    // ERROR: Internal type in public interface
    public func getItems() -> [CartItem] {  // CartItem is internal
        return []
    }
    
    // ERROR: Subclass access modifier broader than superclass
    fileprivate func calculateTotal() -> Decimal {
        return items.reduce(0) { $0 + $1.price }
    }
}

public class SpecialCart: Cart {
    // ERROR: Cannot override fileprivate with public
    public override func calculateTotal() -> Decimal {
        return super.calculateTotal() * 0.9
    }
}

// MARK: - Initialization Errors

class OrderProcessor {
    let orderId: String
    let customer: Customer
    var status: String  // Not initialized
    
    // ERROR: Not all properties initialized before use
    init(orderId: String) {
        self.orderId = orderId
        processOrder()  // Called before customer is initialized
        self.customer = Customer(name: "Test")
    }
    
    func processOrder() {
        print("Processing order: \(orderId)")
    }
}

struct Customer {
    let name: String
    let email: String
    
    // ERROR: Missing memberwise init parameter
    init(name: String) {
        self.name = name
        // email not initialized
    }
}

// MARK: - Operator Errors

// ERROR: Comparing incompatible types
func compareProducts(_ a: Product, _ b: String) -> Bool {
    return a == b  // Cannot compare Product to String
}

// ERROR: Arithmetic on incompatible types
func calculateDiscount(_ price: Decimal, _ percent: Int) -> Decimal {
    return price * percent  // Cannot multiply Decimal by Int directly
}

// ERROR: Optional comparison
func isExpensive(_ price: Decimal?) -> Bool {
    return price > 100  // Cannot compare Decimal? with Int
}

// MARK: - Collection Errors

class Inventory {
    var products: [UUID: Product] = [:]
    
    // ERROR: Wrong subscript type
    func getProduct(at index: Int) -> Product? {
        return products[index]  // Dictionary expects UUID, not Int
    }
    
    // ERROR: Set requires Hashable
    func getUniqueProducts() -> Set<Product> {  // Product not Hashable
        return Set(products.values)
    }
    
    // ERROR: Incompatible array types
    func merge(others: [String]) {
        products.values.append(contentsOf: others)  // [String] != [Product]
    }
}

// MARK: - Async/Await Errors

class AsyncService {
    // ERROR: Missing async annotation
    func fetchData() -> Data {
        await URLSession.shared.data(from: URL(string: "https://api.example.com")!)
    }
    
    // ERROR: Calling async from sync context
    func processAll() {
        let data = fetchDataAsync()  // Missing await
        print(data)
    }
    
    func fetchDataAsync() async -> Data {
        return Data()
    }
    
    // ERROR: Wrong return type for async throws
    func loadUser() async throws -> String {
        return User(id: "1")  // Returns User, declared String
    }
}

// MARK: - SwiftUI Errors (simulated)

struct ContentView {
    // ERROR: @State on non-View type
    @State var counter: Int = 0  // Only valid in View
    
    // ERROR: Missing View protocol conformance
    var body: some View {
        Text("Hello")
    }
}

// ERROR: ObservableObject without @Published
class ViewModel: ObservableObject {
    var items: [String] = []  // Should be @Published
    
    // ERROR: Using @Published on computed property
    @Published var count: Int {
        return items.count
    }
}

// MARK: - Result Builder Errors

@resultBuilder
struct ArrayBuilder {
    static func buildBlock(_ components: Int...) -> [Int] {
        return components
    }
}

// ERROR: Result builder type mismatch
func buildStrings(@ArrayBuilder _ content: () -> [String]) -> [String] {
    return content()  // Builder produces [Int], not [String]
}

// MARK: - Extension Errors

// ERROR: Extending non-existent type
extension NonExistentType {
    func doSomething() {}
}

// ERROR: Conflicting extension requirements
extension Array where Element == Int, Element == String {  // Impossible constraint
    func conflictingMethod() {}
}

// ERROR: Protocol extension with incompatible constraint
extension Collection where Element: Comparable, Self: Equatable {
    // ERROR: Using unavailable method
    func sortAndDedupe() -> [Element] {
        return self.sorted().removingDuplicates()  // removingDuplicates doesn't exist
    }
}

// MARK: - Memory Management Errors

class MemoryLeakExample {
    var closure: (() -> Void)?
    
    // ERROR: Strong reference cycle
    func setupClosure() {
        closure = {
            self.doSomething()  // Should capture [weak self]
        }
    }
    
    func doSomething() {}
}

// ERROR: Weak reference to non-class type
struct WeakHolder {
    weak var product: Product?  // Product is struct, not class
}

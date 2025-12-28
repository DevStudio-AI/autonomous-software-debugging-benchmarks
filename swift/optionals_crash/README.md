# Swift Optionals Crash - User Profile App

An iOS User Profile application demonstrating common Swift optional handling bugs that cause runtime crashes.

## Difficulty: ⭐⭐⭐

## Expected Behavior

### What Should Happen
- App gracefully handles missing user data
- Login failures show appropriate error messages
- API errors display user-friendly feedback
- Empty friend lists show placeholder UI
- Invalid JSON returns nil or throws

### What Actually Happens
- `Fatal error: Unexpectedly found nil while unwrapping`
- `Fatal error: Index out of range`
- `Could not cast value of type 'NSNull' to 'NSString'`
- Crash on app launch if IBOutlets not connected
- Crash on profile view if userId not set

## Build & Run

```bash
swift build
swift test
```

Or open in Xcode:
```bash
open Package.swift
```

## Testing for Bugs

### Force Unwrap Crashes
1. Call `UserService.shared.getCurrentUser()` without logging in
2. Call `getAuthHeader()` after failed login
3. Access `ProfileViewController` without setting `userId`

### API Response Crashes
1. Fetch non-existent user ID
2. Parse JSON with missing required fields
3. Handle API timeout/error responses

### Array Crashes  
1. Access friend at index > array count
2. Call `getFirstFriend()` with empty friends array
3. Call `getTotalFriendsCharacters()` with nil names

### Type Casting Crashes
1. Parse JSON with `"privacy": "3"` (string instead of int)
2. Access nested JSON with missing intermediate keys
3. Parse date with wrong format string

## Project Structure

```
OptionalsCrash/
├── Package.swift
├── OptionalsCrash/
│   └── UserProfile.swift    # All buggy code
└── README.md
```

## Common Fixes (Reference Only)

```swift
// Instead of force unwrap:
return cachedUser!.name!

// Use optional binding:
guard let user = cachedUser, let name = user.name else {
    return "Unknown"
}
return name

// Or nil coalescing:
return cachedUser?.name ?? "Unknown"

// Instead of force cast:
return value as! Int

// Use conditional cast:
return value as? Int ?? 0
```

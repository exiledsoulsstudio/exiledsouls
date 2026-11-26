
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && request.auth.token.admin == true;
    }

    match /novels/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /segments/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /authors/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /reviews/{document=**} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isAdmin();
    }
  }
}

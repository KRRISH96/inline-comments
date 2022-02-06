import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, store } from "../firebase/config";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        setActiveUser(user.providerData[0]);
      } else {
        // User is signed out
        // ...
        setActiveUser(null);
      }
      setLoading(false);
    });
  }, []);


	const signInWithGoogle = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			// This gives you a Google Access Token. You can use it to access the Google API.
			const credential = GoogleAuthProvider.credentialFromResult(result);
			const token = credential.accessToken;
			// The signed-in user info.
			const user = result.user;
			// ...
			await setDoc(doc(store, "users", user.uid), {
				name: user.displayName,
				email: user.email,
				uid: user.uid,
				photoURL: user.photoURL,
				lastSignInTime: user.metadata.lastSignInTime,
			});
			console.log({ token, user, credential });
		} catch (error) {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;
			// The email of the user's account used.
			const email = error.email;
			// The AuthCredential type that was used.
			const credential = GoogleAuthProvider.credentialFromError(error);
			console.log({ errorCode, errorMessage, email, credential });
			// ...
		} finally {
			setLoading(false);
		}
	};

	const signOutUser = async () => {
		setLoading(true);
		try {
			await signOut(auth);
			console.log("signed out!");
		} catch (error) {
			console.log("error signed oout!", { error });
		} finally {
			setLoading(false);
		}
	};

  return { activeUser, loading, signOutUser, signInWithGoogle };
}
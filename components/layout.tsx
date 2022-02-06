import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
	signOut,
	signInWithPopup,
	GoogleAuthProvider,
	onAuthStateChanged,
} from "firebase/auth";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import { auth, store } from "../firebase/config";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";

const name = "Sai Blogger";
export const siteTitle = "Next.js Sample Website";

export default function Layout({
	children,
	home,
}: {
	children: React.ReactNode;
	home?: boolean;
}) {
	const [activeUser, setActiveUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const signInWithGoogle = async () => {
		setIsLoading(true);
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
			setIsLoading(false);
		}
	};

	const signOutUser = async () => {
		setIsLoading(true);
		try {
			await signOut(auth);
			console.log("signed out!");
		} catch (error) {
			console.log("error signed oout!", { error });
		} finally {
			setIsLoading(false);
		}
	};

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
		setIsLoading(false);
	});

	return (
		<div className={styles.container}>
			<Head>
				<link rel="icon" href="/favicon.ico" />
				<meta
					name="description"
					content="Learn how to build a personal website using Next.js"
				/>
				<meta
					property="og:image"
					content={`https://og-image.vercel.app/${encodeURI(
						siteTitle
					)}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
				/>
				<meta name="og:title" content={siteTitle} />
				<meta name="twitter:card" content="summary_large_image" />
			</Head>
			<header className={styles.header}>
				{home ? (
					<>
						<img
							src={activeUser?.photoURL || "/images/profile.jpeg"}
							className={utilStyles.borderCircle}
							height={144}
							width={144}
							alt={name}
						/>
						<h1 className={utilStyles.heading2Xl}>
							{activeUser?.displayName || "@n0nym0u$"}
						</h1>
					</>
				) : (
					<>
						<Link href="/">
							<a>
								<img
									src={activeUser?.photoURL || "/images/profile.jpeg"}
									className={utilStyles.borderCircle}
									height={108}
									width={108}
									alt={name}
								/>
							</a>
						</Link>
						<h2 className={utilStyles.headingLg}>
							<Link href="/">
								<a className={utilStyles.colorInherit}>
									{activeUser?.displayName || "@n0nym0u$"}
								</a>
							</Link>
						</h2>
					</>
				)}
				{isLoading ? (
					<div>Loading....</div>
				) : !!activeUser?.uid ? (
					<>
						<button onClick={signOutUser}>Sign Out</button>
					</>
				) : (
					<button onClick={signInWithGoogle}>Sign In</button>
				)}
			</header>
			<main>{children}</main>
			{!home && (
				<div className={styles.backToHome}>
					<Link href="/">
						<a>← Back to home</a>
					</Link>
				</div>
			)}
		</div>
	);
}

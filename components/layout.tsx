import Head from "next/head";
import Link from "next/link";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import { useAuth } from "../hooks/useAuth";

const name = "Sai Blogger";
export const siteTitle = "Next.js Sample Website";

export default function Layout({
	children,
	home,
}: {
	children: React.ReactNode;
	home?: boolean;
}) {
	const {
		activeUser,
		loading: authLoading,
		signOutUser,
		signInWithGoogle,
	} = useAuth();

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
				{!!activeUser?.uid ? (
					<button onClick={signOutUser}>
						{authLoading ? "Signing out..." : "Sign Out"}
					</button>
				) : (
					<button onClick={signInWithGoogle}>
						{authLoading ? "Signing in..." : "Sign In"}
					</button>
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

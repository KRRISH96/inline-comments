import Layout from "../../components/layout";
import { getPost, getPostComments } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import {
	addDoc,
	collection,
	doc,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { auth, store } from "../../firebase/config";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

type Comment = {
	text: string;
	nodeId: string;
	commeent: string;
	date: Timestamp;
};

const RESET_COMMENT = {
	comment: "",
	nodeId: "",
	text: "",
};

async function updatePost(postId) {
	const res = await updateDoc(doc(store, "posts", postId), {
		contentHtml: document.getElementById("content").innerHTML,
	});
	console.log(res);
}

function attachComments(comments) {
	const comms = JSON.parse(comments);
	return comms.map((com) => {
		const node = document.getElementById(com.nodeId);
		if (node) {
			const rect = node.getBoundingClientRect();
			return { ...com, rect: { ...rect, top: window.scrollY + rect.top } };
		}
	});
}

export default function Post({
	postData,
	comments,
}: {
	postData: {
		id: string;
		slug: string;
		title: string;
		date: string;
		contentHtml: string;
	};
	comments: Comment[];
}) {
	const { activeUser } = useAuth();

	const [showCommentBtn, setShowCommentBtn] = useState(false);
	const [showCommentForm, setShowCommentForm] = useState(false);
	const [showCommentBtnPos, setShowCommentBtnPos] = useState<DOMRect | null>();
	const [commentObj, setCommentObj] = useState(RESET_COMMENT);
	const [allComments, setAllComments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setAllComments(attachComments(comments));
	}, []);

	const scrollYOffset = () => window.scrollY - 40;

	const handleOnSelect = (e) => {
		const sel = document.getSelection();

		if (sel.toString()) {
			const range = sel.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			highlightSelectionAndInitializeComment(range, sel);

			setShowCommentBtnPos(rect);
			setShowCommentBtn(true);
		}
	};

	function highlightSelectionAndInitializeComment(range, sel) {
		let selectedContent = range.extractContents();
		var span = document.createElement("span");
		span.id = "get-a-random-id-" + Math.random() * 10000;
		span.appendChild(selectedContent);
		range.insertNode(span);
		setCommentObj((c) => ({
			...c,
			nodeId: span.id,
			text: sel.toString(),
		}));
	}

	const handleNewComment = async (e) => {
		e.preventDefault();

		if (!activeUser?.uid) return;

		setIsLoading(true);

		try {
			let postRef = doc(store, "posts", postData.id);
			let commentsRef = collection(postRef, "comments");
			await updatePost(postData.id);

			const newComment = {
				date: Timestamp.now(),
				...commentObj,
			};
			const commRef = await addDoc(commentsRef, newComment);

			if (commRef.id) {
				setCommentObj(RESET_COMMENT);
				setAllComments((prevComms) => [
					...prevComms,
					{
						...newComment,
						rect: { top: scrollYOffset() + showCommentBtnPos.top },
					},
				]);
				setShowCommentForm(false);
				setShowCommentBtn(false);
			}
		} catch (e) {
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<Head>
				<title>{postData.title}</title>
			</Head>
			<main className="container">
				<article onMouseUp={handleOnSelect}>
					<h1 className={utilStyles.headingXl}>{postData.title}</h1>
					<div className={utilStyles.lightText}>
						<Date dateString={postData.date} />
					</div>
					<div
						className="content"
						id="content"
						dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
					/>
					{showCommentBtn && (
						<button
							className="highlight-comment-btn"
							style={{
								top: scrollYOffset() + showCommentBtnPos.top,
								left: showCommentBtnPos.left + 20,
							}}
							onClick={() => setShowCommentForm(true)}
							disabled={!activeUser?.uid}
						>
							{!activeUser?.uid ? "login to " : ""} comment
						</button>
					)}
				</article>
				<aside>
					<p>{allComments.length} Comments</p>
					{allComments.map(({ nodeId, rect, comment }) => (
						<p key={nodeId} style={{ top: rect.top }} className="comment">
							{comment}
						</p>
					))}
					{showCommentForm && (
						<form
							onSubmit={handleNewComment}
							className="comment-form"
							style={{ top: scrollYOffset() + showCommentBtnPos.top }}
						>
							<textarea
								name="comment"
								value={commentObj.comment}
								onChange={({ target }) =>
									setCommentObj((c) => ({ ...c, comment: target.value }))
								}
							/>
							<button type="submit" disabled={!activeUser?.uid}>
								{isLoading ? "saving..." : "save"}
							</button>
						</form>
					)}
				</aside>
			</main>
		</Layout>
	);
}

export const getServerSideProps = async (req) => {
	const postData = await getPost(req.query.id);
	if (!postData) return { notFound: true };

	const comments = JSON.stringify(await getPostComments(req.query.id));
	return { props: { postData: { id: req.query.id, ...postData }, comments } };
};

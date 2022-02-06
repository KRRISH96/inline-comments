import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { store } from '../firebase/config'

export async function getAllPosts() {  
  const allPosts = [];

  const posts = await getDocs(collection(store, "posts"));
  posts.forEach((doc) => {
    allPosts.push({...doc.data(), id: doc.id});
  });

  return allPosts;
}

export async function getPost(postId) {  
  const docRef = doc(store, "posts", postId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

export async function getPostComments(postId) { 
  const allComments = []; 
  const docRef = doc(store, "posts", postId);
  const comments = await getDocs(collection(docRef, 'comments'));
  
  comments.forEach((doc) => {
    allComments.push({...doc.data(), id: doc.id});
  });
  console.log(allComments);

  return allComments;
}
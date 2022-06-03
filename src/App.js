import React, { useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyD1FPTFzVZipyBe8-IdNoBvLvHXD9F193M",
  authDomain: "da-social-1fa05.firebaseapp.com",
  projectId: "da-social-1fa05",
  storageBucket: "da-social-1fa05.appspot.com",
  messagingSenderId: "573865783986",
  appId: "1:573865783986:web:c5383e890fee7f74b70fab",
  measurementId: "G-2KYS52PTG5"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <SignOut />
      </header>

      <section>
        {user ? <Posts /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Posts() {

  const postsRef = firestore.collection('posts');
  const query = postsRef.orderBy('createdAt').limit(25);

  const [posts] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const postPost = (e) => {

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

      postsRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid, 
      photoURL
    });

    setFormValue('');
  }

  return (
    <>
    <form onSubmit={postPost}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

      <button type='submit'>POST</button>

    </form>
      <div className='posts'>
        {posts && posts.map(post => <Post key={post.id} post={post} />)}
      </div>
    </>
  )
}

function Post(props) {
  const { text, photoURL } = props.post;

  return (
    <div className='post'>

      <div className='header'>
        <img className='pfp' src={photoURL} alt='pfp'/>
        <p>{text}</p>
      </div>

      <div className='content'>
        test
      </div>

    </div>
  )
}

export default App;

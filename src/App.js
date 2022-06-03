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
        <SignOut/>
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
    <button 
      onClick={() => auth.signOut()} 
      style={{padding: 10, fontSize: 14, margin: 10, width: 500, borderRadius: 7}}
    >
      Sign Out
    </button>
  )
}

function Posts() {

  const postsRef = firestore.collection('posts');
  const query = postsRef.orderBy('createdAt', 'desc').limit(25);

  const [posts] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [mediaValue, setMediaValue] = useState('');

  const postPost = async (e) => {
    e.preventDefault();

    if (!formValue)
      return

    const { uid, photoURL, displayName } = auth.currentUser;

    await postsRef.add({
      username: displayName,
      text: formValue,
      media: mediaValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    setMediaValue('');
  }

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
          var blob = item.getAsFile();
          var reader = new FileReader();
          reader.onload = function (event) {
              setMediaValue(event.target.result); // data url!
          };
          reader.readAsDataURL(blob);
        }
    }
  };

  return (
    <>
    <form className='form' onSubmit={postPost}>

      <input className='input' placeholder='Type something...' onPaste={handlePaste} value={formValue} onChange={(e) => setFormValue(e.target.value)} />

      <button style={{ paddingLeft: 10, paddingRight: 10 }} type='submit'>&gt;</button>

      
    </form>
    <div className='preview'>
      <img src={mediaValue} alt='' onClick={() => setMediaValue('')}/>
    </div>
    <div className='posts'>
      {posts && posts.map(post => <Post key={post.id} post={post} />)}
    </div>
    </>
  )
}

function Post(props) {
  const { username, text, media, photoURL, createdAt } = props.post;
  let postDate;
  if (createdAt)
    postDate = new Date(createdAt.seconds*1000).toLocaleString('en-us', { timeZone: 'UTC' });
  
  return (
    <div className='post'>

      <div className='header'>
        <img className='pfp' src={photoURL} alt='pfp'/>
        <h4>{username}</h4>
        
      </div>
        <div className='content'>
          <p>{text}</p>
        </div>
      <div className='media'>
        <img src={media} alt='' />
      </div>
      <small style={{ float: 'right', margin: 5 }}>{postDate}</small>

    </div>
  )
}

export default App;

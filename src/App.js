import React, { useState } from 'react';
import './App.css';

// React-Bootstrap
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

// Firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// Firestore
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Init firebase
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
        {/* Only load posts when user is logged in */}
        {user ? <Feed /> : <SignIn/>}
      </section>
    </div>
  );
}

// SignInWithGoogle Component
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
      <Button onClick={signInWithGoogle}>Sign in with Google</Button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <Button 
      onClick={() => auth.signOut()} 
      style={{padding: 10, fontSize: 14, margin: 10, width: 500, borderRadius: 7}}
    >
      Sign Out
    </Button>
  )
}

// Main post feed
function Feed() {

  // Retrieve posts from firebase db
  const postsRef = firestore.collection('posts');
  const query = postsRef.orderBy('createdAt', 'desc').limit(25);

  const [feed] = useCollectionData(query, { idField: 'id' });

  // Form inputs state from user to post posts
  const [formValue, setFormValue] = useState('');
  const [mediaValue, setMediaValue] = useState('');

  // Post posts
  const postPost = async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Prevent posting empty posts
    if (!formValue)
      return

      // Get user data of current user
    const { uid, photoURL, displayName } = auth.currentUser;

    // Post to database with following metadata
    await postsRef.add({
      username: displayName,
      text: formValue,
      media: mediaValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    // Reset form inputs
    setFormValue('');
    setMediaValue('');
  }

  // Handle image paste into input by converting into base64
  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (var index in items) {
        const item = items[index];
        if (item.kind === 'file') {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = function (event) {
              // Set media state value
              setMediaValue(event.target.result); // base64 data url!
          };
          reader.readAsDataURL(blob);
        }
    }
  };

  // Main post feed structure
  return (
    <>
    {/* User form input */}
    <form className='form' onSubmit={postPost}>

      { /* Text and media input */ }
      <input 
        className='input' 
        placeholder='Type something...' 
        onPaste={handlePaste} 
        value={formValue} 
        onChange={(e) => setFormValue(e.target.value)} 
      />
      
      { /* Form Buttons */}
      <ButtonGroup>
        { /* Post button  */}
        <Button
          variant='primary' 
          style={{ paddingLeft: 10, paddingRight: 10 }} 
          type='submit'
        >
          &gt;
        </Button>
        { /* TODO: File attachment button */ }
      </ButtonGroup>
      
    </form>

    { /* Preview attached files */ }
    <div className='preview'>
      { /* Image preview and removable on click */ }
      <img src={mediaValue} alt='' onClick={() => setMediaValue('')}/>
    </div>

    { /* Main feed of posts */ }
    <div className='feed'>
      { /* Create post component for each post in feed */ }
      {feed && feed.map(post => <Post key={post.id} post={post} />)}
    </div>
    </>
  )
}

function Post(props) {
  // Get metadata of post
  const { username, photoURL, text, media, createdAt } = props.post;

  // Get post date if metadata is available
  const postDate = createdAt ? 
    new Date(createdAt.seconds*1000).toLocaleString('en-us', { timeZone: 'UTC' })
    : null;
  
  // Individual post struct
  return (
    <div className='post'>

      { /* Header with user pfp + username */ }
      <div className='header'>
        <img className='pfp' src={photoURL} alt='pfp'/>
        <h4>{username}</h4>
      </div>

      { /* Main content body */ }
      <div className='content'>
          <p>{text}</p>
      </div>

      { /* Attached media */ }
      <div className='media'>
        <img src={media} alt='' />
      </div>

      { /* Date metadata */ }
      <small style={{ float: 'right', margin: 5 }}>{postDate}</small>

    </div>
  )
}

export default App;

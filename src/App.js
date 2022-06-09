import React, { useState } from 'react';

// React-Bootstrap
import { 
  Button, 
  ButtonGroup, 
  Container, 
  Form, 
  Navbar,
  Image,
  Card,
  Stack
} from 'react-bootstrap';

import { 
  ArrowRight, 
  ArrowBarUp, 
  Google 
} from 'react-bootstrap-icons';

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
  const postsRef = firestore.collection('posts');
  const query = postsRef.orderBy('createdAt', 'desc').limit(25);
  const [feed] = useCollectionData(query, { idField: 'id' });

  return (
    <>
    { /*  Navbar */ }
    <Navbar bg='light'>
      <Container>
        <Navbar.Brand href="#home">Da Social</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {user ? <SignOut /> : <SignIn />}
        </Navbar.Collapse>
      </Container>
    </Navbar>

    { /* Main body */ }
    <div className='d-flex justify-content-center'>
      <Stack gap={3} style={{maxWidth: 500}}>
        <div className='m-4'>
          { /* Post Form Input */ }
          { user ? <PostInput postsRef={postsRef}/> : null }
          { /* Feed */ }
          <Feed feed={feed}/>
        </div>
      </Stack>
    </div>
    </>
  );
}

// SignInWithGoogle Component
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
      <Button onClick={signInWithGoogle}>
        <Google style={{margin: 5}}/>
        Sign in with Google
      </Button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <div>
      <Navbar.Text style={{marginRight: 10}}>
        Signed in as: <a href="#login">{auth.currentUser.email}</a>
      </Navbar.Text>
      <Button onClick={() => auth.signOut()}>
        Sign Out
      </Button>
    </div>
  )
}

function PostInput(props) {
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
    await props.postsRef.add({
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

  return (
    <>
    {/* User form input */}
    <Form>
    { /* Text and media input */ }
    <Form.Group>
      <Form.Control
        as='textarea'
        placeholder='Type something...' 
        onPaste={handlePaste} 
        value={formValue} 
        onChange={(e) => setFormValue(e.target.value)} 
      />
    </Form.Group>
    
    { /* Form Buttons */}
    <ButtonGroup>
      { /* File attachment button */ }
      <Button type='submit'>
        <ArrowBarUp />
      </Button>
      { /* Post button  */}
      <Button type='submit' onClick={postPost}>
        <ArrowRight />
      </Button>
      
    </ButtonGroup>
    
  </Form>

  { /* Preview attached files */ }
  <div>
    { /* Image preview and removable on click */ }
    <img src={mediaValue} alt='' onClick={() => setMediaValue('')}/>
  </div>
  </>
  );
}

// Main post feed
function Feed(props) {
  // Main post feed structure
  return (
    <>
    { /* Main feed of posts */ }
    <Stack gap={3}>
      { /* Create post component for each post in feed */ }
      {props.feed && props.feed.map(post => <Post key={post.id} post={post} />)}
    </Stack>
    </>
  );
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
    <Card>
      <Card.Header>
        <Image 
          style={{width: 40, height: 40, marginRight: 10}} 
          roundedCircle={true} 
          src={photoURL} 
          alt='pfp' 
        />
        {username}
      </Card.Header>
      <Card.Body>
        <Card.Text>{text}</Card.Text>
        { media ? <Image thumbnail={true} src={media} /> : null }
        <Card.Footer>{postDate}</Card.Footer>
      </Card.Body>
  </Card>
  )
}

export default App;

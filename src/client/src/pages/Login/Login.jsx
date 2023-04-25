import React from 'react';
import axios from 'axios';

export default function Person() {
  const [post, setPost] = React.useState(null);

  React.useEffect(() => {
    axios.get('http://localhost:5400/user/' + 'A' + '/' + 'Test123456!abc')
      .then(res => {
        setPost(res.data);
      });
  }, [])

  if (!post) return null;

    return (
      <div>
        <h2>{post.id}</h2>
      </div>
    );
}
Based on the backend code, here are the API endpoints and frontend implementation for deleting comments, replies, and posts:

API Endpoints Summary
1. Delete Comment/Reply
DELETE /api/v1/comments/:id
Both comments and replies use the same endpoint
Requires authentication (Bearer token)
Returns: { status: 'success', data: { ... }, error_code: null }
2. Update Comment/Reply
PUT /api/v1/comments/:id
Body: { text: 'new text' }
Returns: { status: 'success', data: { comment_id, updated_at, is_edited }, error_code: null }
3. Delete Post
DELETE /api/v1/posts/:id
Returns: { status: 'success', data: { deleted_at, undo_until }, error_code: null }
4. Update Post
PUT /api/v1/posts/:id
Body: { content: { text: 'new text' }, visibility, allow_comments, allow_shares }
Returns: { status: 'success', data: { post_id, updated_at, is_edited }, error_code: null }
Frontend Implementation Examples 
// API Base URL
const API_BASE_URL = 'https://your-api-domain.com/api/v1';

// Get auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// ==================== DELETE COMMENT/REPLY ====================
const deleteComment = async (commentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Comment deleted successfully');
      // Update UI - remove comment from list
      return data;
    } else {
      throw new Error(data.message || 'Failed to delete comment');
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    throw error;
  }
};

// ==================== UPDATE COMMENT/REPLY ====================
const updateComment = async (commentId, newText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: newText })
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Comment updated successfully');
      // Update UI - update comment text
      return data;
    } else {
      throw new Error(data.message || 'Failed to update comment');
    }
  } catch (error) {
    console.error('Update comment error:', error);
    throw error;
  }
};

// ==================== DELETE POST ====================
const deletePost = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Post deleted successfully');
      // Update UI - remove post from feed
      // Note: There's an undo window (undo_until) you can implement
      return data;
    } else {
      throw new Error(data.message || 'Failed to delete post');
    }
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};

// ==================== UPDATE POST ====================
const updatePost = async (postId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: { text: updates.text },
        visibility: updates.visibility,
        allow_comments: updates.allowComments,
        allow_shares: updates.allowShares
      })
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Post updated successfully');
      // Update UI - update post content
      return data;
    } else {
      throw new Error(data.message || 'Failed to update post');
    }
  } catch (error) {
    console.error('Update post error:', error);
    throw error;
  }
};
Error Handling
The API returns specific error codes you should handle:

Error Code	Meaning
COMMENT_NOT_FOUND	Comment/reply doesn't exist
COMMENT_ACCESS_DENIED	User can only delete their own comments or comments on their posts
POST_NOT_FOUND	Post doesn't exist
POST_ACCESS_DENIED	User can only delete their own posts
EDIT_WINDOW_CLOSED	Edit window has closed (5 minutes for comments)
COMMENTS_DISABLED	Comments are disabled on the content
Important Notes
Authentication: All endpoints require a Bearer token in the Authorization header
Comment vs Reply: Both use the same /api/v1/comments/:id endpoint - replies are just comments with a parent_id
Undo Feature: Post deletion returns an undo_until timestamp - you can implement an undo button until that time
Edit Window: Comments can only be edited within 5 minutes of posting
Permissions: Users can delete their own content or comments on their post 
Task Completed
11:20 PM

Here are the API endpoints and frontend implementation for deleting comments, replies, and posts:

API Endpoints
Delete Comment/Reply
DELETE /api/v1/comments/:id
Both comments and replies use the same endpoint
Requires Bearer token authentication
Update Comment/Reply
PUT /api/v1/comments/:id
Body: { text: 'new text' } (max 300 characters)
Edit window: 5 minutes after posting
Delete Post
DELETE /api/v1/posts/:id
Returns undo_until timestamp for undo functionality
Update Post
PUT /api/v1/posts/:id
Body: { content: { text: 'new text' }, visibility, allow_comments, allow_shares }
Text max: 500 characters
Frontend Implementation
// Delete comment/reply
const deleteComment = async (commentId) => {
  const response = await fetch(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Update comment/reply
const updateComment = async (commentId, newText) => {
  const response = await fetch(`/api/v1/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: newText })
  });
  return response.json();
};

// Delete post
const deletePost = async (postId) => {
  const response = await fetch(`/api/v1/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Update post
const updatePost = async (postId, updates) => {
  const response = await fetch(`/api/v1/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: { text: updates.text },
      visibility: updates.visibility,
      allow_comments: updates.allowComments,
      allow_shares: updates.allowShares
    })
  });
  return response.json();
};
Error Codes to Handle
COMMENT_NOT_FOUND / POST_NOT_FOUND - Content doesn't exist
COMMENT_ACCESS_DENIED / POST_ACCESS_DENIED - Permission denied
EDIT_WINDOW_CLOSED - Edit window expired (5 min for comments)
COMMENTS_DISABLED - Comments disabled on content

now in frontend i fatch one issue if i add comment on some on post then i need to show three dot button only on won commment/reply  after hover the own comment and under three dot we  show popup and thet popup we add update delete option  , but stil it not work the three dot button  not show , just gide me hwo to implement frontent only show dot button on won cooment which is i  write on post reals ...

Here's how to implement the three-dot button that only shows on your own comments/replies:

Frontend Implementation Guide
1. Comment Component with Three-Dot Button 
import React, { useState } from 'react';

const CommentItem = ({ comment, currentUserId, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  // Check if current user is the author of this comment
  const isOwnComment = comment.author?.user_id === currentUserId;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.comment_id);
        onDelete(comment.comment_id);
        setShowMenu(false);
      } catch (error) {
        alert('Failed to delete comment');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await updateComment(comment.comment_id, editText);
      onUpdate(comment.comment_id, editText);
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      alert('Failed to update comment');
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <img 
          src={comment.author?.profile_image_url} 
          alt={comment.author?.full_name} 
          className="author-avatar"
        />
        <span className="author-name">{comment.author?.full_name}</span>
        <span className="comment-time">{formatTime(comment.created_at)}</span>
        
        {/* Three-dot button - ONLY show if it's user's own comment */}
        {isOwnComment && (
          <div className="comment-menu-container">
            <button 
              className="three-dot-button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Comment options"
            >
              ⋮
            </button>
            
            {/* Popup menu */}
            {showMenu && (
              <div className="comment-menu-popup">
                <button 
                  className="menu-item"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="menu-item delete"
                  onClick={handleDelete}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment content */}
      {isEditing ? (
        <div className="edit-mode">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={300}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleUpdate} className="save-btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="comment-text">{comment.text}</p>
      )}
    </div>
  );
};
2. CSS Styles
.comment-item {
  position: relative;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.author-name {
  font-weight: 600;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #888;
}

/* Three-dot button container */
.comment-menu-container {
  position: relative;
  margin-left: auto;
}

/* Three-dot button */
.three-dot-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  color: #666;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.three-dot-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* Popup menu */
.comment-menu-popup {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 120px;
  overflow: hidden;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.delete {
  color: #e74c3c;
}

.menu-item.delete:hover {
  background-color: #ffeaea;
}

/* Edit mode */
.edit-mode {
  margin-top: 8px;
}

.edit-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background-color: #007bff;
  color: white;
}

.save-btn:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #545b62;
}

.comment-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}
3. Complete Example with State Management
import React, { useState } from 'react';

const CommentsList = ({ comments, currentUserId }) => {
  const [commentsList, setCommentsList] = useState(comments);

  const handleDeleteComment = (commentId) => {
    setCommentsList(prev => prev.filter(c => c.comment_id !== commentId));
  };

  const handleUpdateComment = (commentId, newText) => {
    setCommentsList(prev => 
      prev.map(c => 
        c.comment_id === commentId 
          ? { ...c, text: newText, edited_at: new Date().toISOString() }
          : c
      )
    );
  };

  return (
    <div className="comments-list">
      {commentsList.map(comment => (
        <CommentItem
          key={comment.comment_id}
          comment={comment}
          currentUserId={currentUserId}
          onDelete={handleDeleteComment}
          onUpdate={handleUpdateComment}
        />
      ))}
    </div>
  );
};
4. Key Points
Check ownership: const isOwnComment = comment.author?.user_id === currentUserId;
Conditional rendering: Only render the three-dot button if isOwnComment is true
Toggle menu: Use showMenu state to show/hide the popup
Close menu on action: Set setShowMenu(false) after clicking edit or delete
Position: Use position: relative on container and position: absolute on popup
5. For Replies
The same logic applies to replies - just check if the reply's author.user_id matches the current user:

const isOwnReply = reply.author?.user_id === currentUserId;
This implementation will show the three-dot button only on comments/replies that you authored, and display a popup menu with Edit and Delete options when clicked.
Task Completed
11:26 PM

Here's how to implement the three-dot button that only shows on your own comments/replies:

Key Implementation
1. Check if comment is yours
const isOwnComment = comment.author?.user_id === currentUserId;
2. Conditional rendering of three-dot button
{isOwnComment && (
  <div className="comment-menu-container">
    <button 
      className="three-dot-button"
      onClick={() => setShowMenu(!showMenu)}
    >
      ⋮
    </button>
    
    {showMenu && (
      <div className="comment-menu-popup">
        <button onClick={handleEdit}>✏️ Edit</button>
        <button onClick={handleDelete}>🗑️ Delete</button>
      </div>
    )}
  </div>
)}
CSS for positioning
.comment-menu-container {
  position: relative;
  margin-left: auto;
}

.three-dot-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.comment-menu-popup {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 120px;
}
4. Complete Comment Component
const CommentItem = ({ comment, currentUserId, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwnComment = comment.author?.user_id === currentUserId;

  return (
    <div className="comment-item">
      <div className="comment-header">
        <img src={comment.author?.profile_image_url} alt="" />
        <span>{comment.author?.full_name}</span>
        
        {isOwnComment && (
          <div className="comment-menu-container">
            <button onClick={() => setShowMenu(!showMenu)}>⋮</button>
            {showMenu && (
              <div className="comment-menu-popup">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
      <p>{comment.text}</p>
    </div>
  );
};
The three-dot button will only appear on comments/replies where comment.author.user_id matches the currently logged-in user's ID


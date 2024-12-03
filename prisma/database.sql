CREATE TABLE blogs (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL, 
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(user_id) REFERENCES USER(id)
);

CREATE TABLE tags (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blog_tags (
    blog_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY(blog_id) REFERENCES blog(id),
    FOREIGN KEY(tag_id) REFERENCES tags(id),
    PRIMARY KEY(blog_id, tag_id)
);
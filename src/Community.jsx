import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Heart, MessageCircle, Share2, Plus,
  Search, Shield, Star, MoreHorizontal, X, Send, Image as ImageIcon,
  Phone, Mail, UserCheck, Clock
} from 'lucide-react';
import { getPosts, getCommunityRisk, createPost as apiCreatePost, toggleLike as apiToggleLike, addComment as apiAddComment, getGroups, joinGroup as apiJoinGroup, leaveGroup as apiLeaveGroup, getMyCircle } from './api/community.api';

export default function Community() {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [circle, setCircle] = useState([]);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    console.log('[Community] Fetching posts');
    getPosts().then(res => {
      console.log('[Community] Posts fetch success:', res.data);
      const mapped = (res.data.posts || []).map(p => ({
        id: p._id,
        author: p.authorName,
        avatar: 'bg-orange-300',
        time: new Date(p.createdAt).toLocaleDateString(),
        badge: p.badge ? `\u{2728} ${p.badge}` : '',
        content: p.content,
        likes: p.likeCount || 0,
        isLiked: p.isLiked || false,
        commentsList: (p.comments || []).map(c => ({
          id: c._id,
          author: c.authorName,
          avatar: 'bg-blue-300',
          text: c.text,
          time: new Date(c.createdAt).toLocaleDateString(),
        })),
      }));
      setPosts(mapped);
      console.log('[Community] Posts mapped:', mapped.length);
    }).catch((err) => {
      console.log('[Community] Posts fetch failed:', err?.response?.data || err.message);
    });

    console.log('[Community] Fetching groups');
    getGroups().then(res => {
      console.log('[Community] Groups fetch success:', res.data.groups || []);
      setGroups(res.data.groups || []);
    }).catch((err) => {
      console.log('[Community] Groups fetch failed:', err?.response?.data || err.message);
    });

    console.log('[Community] Fetching safe circle');
    getMyCircle().then(res => {
      console.log('[Community] Safe circle fetch success:', res.data.circle || []);
      setCircle(res.data.circle || []);
    }).catch((err) => {
      console.log('[Community] Safe circle fetch failed:', err?.response?.data || err.message);
    });

    console.log('[Community] Fetching community risk');
    getCommunityRisk().then(res => {
      console.log('[Community] Community risk fetch success:', res.data);
    }).catch((err) => {
      console.log('[Community] Community risk fetch failed:', err?.response?.data || err.message);
    });
  }, []);

  const handleLike = (id) => {
    console.log('[Community] handleLike start:', id);
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
    console.log('[Community] handleLike optimistic update applied:', id);
    apiToggleLike(id).then((res) => {
      console.log('[Community] handleLike API success:', id, res.data);
    }).catch((err) => {
      console.log('[Community] handleLike API failed:', id, err?.response?.data || err.message);
    });
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    console.log('[Community] handleCreatePost start:', newPostContent);
    apiCreatePost(newPostContent).then(res => {
      console.log('[Community] handleCreatePost API success:', res.data);
      const p = res.data.post;
      const newPost = {
        id: p._id,
        author: p.authorName || 'You',
        avatar: 'bg-[#7D9C6D]',
        time: 'Just now',
        badge: p.badge ? `\u{1F4AC} ${p.badge}` : '\u{1F4AC} General Update',
        content: p.content,
        likes: 0,
        isLiked: false,
        commentsList: [],
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
      console.log('[Community] handleCreatePost optimistic insert complete:', newPost.id);
    }).catch((err) => {
      console.log('[Community] handleCreatePost API failed, using local fallback:', err?.response?.data || err.message);
      const newPost = {
        id: Date.now(),
        author: 'You',
        avatar: 'bg-[#7D9C6D]',
        time: 'Just now',
        badge: '\u{1F4AC} General Update',
        content: newPostContent,
        likes: 0,
        isLiked: false,
        commentsList: [],
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
      console.log('[Community] handleCreatePost local fallback inserted:', newPost.id);
    });

    setNewPostContent('');
    setIsComposeOpen(false);
  };

  const handleToggleComments = (id) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  const handleAddComment = (postId) => {
    if (!newCommentText.trim()) return;

    console.log('[Community] handleAddComment start:', { postId, text: newCommentText });
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: Date.now(),
          author: 'You',
          avatar: 'bg-[#7D9C6D]',
          text: newCommentText,
          time: 'Just now'
        };
        return { ...p, commentsList: [...p.commentsList, newComment] };
      }
      return p;
    }));
    console.log('[Community] handleAddComment optimistic update applied:', postId);
    apiAddComment(postId, newCommentText).then((res) => {
      console.log('[Community] handleAddComment API success:', postId, res.data);
    }).catch((err) => {
      console.log('[Community] handleAddComment API failed:', postId, err?.response?.data || err.message);
    });
    setNewCommentText('');
  };

  const handleToggleGroup = (groupId) => {
    const group = groups.find(g => (g.id || g._id) === groupId);
    if (!group) return;

    if (group.joined) {
      console.log('[Community] Leaving group:', groupId);
      setGroups(prevGroups => prevGroups.map(g => (g.id || g._id) === groupId
        ? { ...g, joined: false, memberCount: Math.max(0, (g.memberCount || 0) - 1) }
        : g
      ));
      apiLeaveGroup(groupId).then((res) => {
        console.log('[Community] Leave group success:', groupId, res.data);
      }).catch((err) => {
        console.log('[Community] Leave group failed:', groupId, err?.response?.data || err.message);
        setGroups(prev => prev.map(g => (g.id || g._id) === groupId
          ? { ...g, joined: true, memberCount: (g.memberCount || 0) + 1 }
          : g
        ));
      });
    } else {
      console.log('[Community] Joining group:', groupId);
      setGroups(prevGroups => prevGroups.map(g => (g.id || g._id) === groupId
        ? { ...g, joined: true, memberCount: (g.memberCount || 0) + 1 }
        : g
      ));
      apiJoinGroup(groupId).then((res) => {
        console.log('[Community] Join group success:', groupId, res.data);
      }).catch((err) => {
        console.log('[Community] Join group failed:', groupId, err?.response?.data || err.message);
        setGroups(prev => prev.map(g => (g.id || g._id) === groupId
          ? { ...g, joined: false, memberCount: Math.max(0, (g.memberCount || 0) - 1) }
          : g
        ));
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 bg-[#FAFAFA] relative flex flex-col h-full overflow-hidden font-sans"
    >
      {/* --- HEADER --- */}
      <div className="pt-12 px-6 pb-4 bg-white rounded-b-[40px] shadow-sm z-20 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Users className="text-[#7D9C6D]" /> Safe Space
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">You are never alone in this.</p>
          </div>
          <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Search size={20} />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
          {[
            { id: 'feed', label: 'Feed' },
            { id: 'groups', label: 'Groups' },
            { id: 'circle', label: 'My Safe Circle' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-white text-[#7D9C6D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 hide-scrollbar">
        <AnimatePresence mode="popLayout">
          
          {/* FEED VIEW */}
          {activeTab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              
              {/* --- NEW: PROMINENT COMPOSE BOX --- */}
              <div className="bg-white p-4 rounded-[28px] shadow-sm border border-gray-100 mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#7D9C6D] shrink-0 border-2 border-[#D9ECA2] flex items-center justify-center text-white font-bold">You</div>
                  <button 
                    onClick={() => setIsComposeOpen(true)}
                    className="flex-1 bg-gray-50 text-left text-gray-500 px-5 py-3.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    Share your experience or ask for support...
                  </button>
                </div>
                <div className="flex justify-end px-2">
                   <button 
                     onClick={() => setIsComposeOpen(true)}
                     className="text-[#7D9C6D] text-sm font-bold flex items-center gap-1 hover:text-[#6b865d]"
                   >
                     <ImageIcon size={16} /> Add Photo
                   </button>
                </div>
              </div>

              {/* POSTS LIST */}
              {posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Heart size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-semibold">No posts yet.</p>
                  <p className="text-gray-300 text-sm mt-1">Be the first to share your journey!</p>
                </div>
              )}
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 mb-5 overflow-hidden">
                  
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${post.avatar} border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs`}>
                        {post.author === 'You' ? 'You' : ''}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{post.author}</h4>
                        <p className="text-xs text-gray-400 font-medium">{post.time}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                  </div>

                  {/* Badge & Content */}
                  <div className="inline-block px-3 py-1 bg-[#D9ECA2]/40 text-[#7D9C6D] rounded-lg text-xs font-bold mb-3">
                    {post.badge}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {/* Action Bar */}
                  <div className="flex items-center gap-6 border-t border-gray-50 pt-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${post.isLiked ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "animate-[ping_0.3s_ease-out]" : ""} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${expandedPostId === post.id ? 'text-[#7D9C6D]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <MessageCircle size={20} />
                      <span className="text-sm">{post.commentsList.length}</span>
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  <AnimatePresence>
                    {expandedPostId === post.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-gray-50"
                      >
                        <div className="space-y-4 mb-4">
                          {post.commentsList.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full ${comment.avatar} shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}>
                                {comment.author === 'You' ? 'You' : ''}
                              </div>
                              <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-1 border border-gray-100">
                                <div className="flex items-baseline justify-between mb-1">
                                  <span className="font-bold text-gray-800 text-xs">{comment.author}</span>
                                  <span className="text-[10px] font-bold text-gray-400">{comment.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-snug">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                          {post.commentsList.length === 0 && (
                            <p className="text-xs text-center font-bold text-gray-400 py-2">Be the first to share support.</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newCommentText} 
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="Add a supportive comment..." 
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#7D9C6D]"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            className="w-10 h-10 bg-[#7D9C6D] text-white rounded-full flex items-center justify-center hover:bg-[#6b865d] transition-colors shrink-0"
                          >
                            <Send size={16} className="ml-0.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ))}
            </motion.div>
          )}

          {/* GROUPS VIEW */}
          {activeTab === 'groups' && (
            <motion.div key="groups" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-extrabold text-gray-800 text-lg mb-2">Suggested for you</h2>
              {groups.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No groups available yet.</p>
              )}
              {groups.map(group => (
                <div key={group.id || group._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6DA] text-[#7D9C6D] flex items-center justify-center text-2xl">
                      {group.icon || <Shield size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{group.name}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{(group.memberCount || 0).toLocaleString()} members</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleGroup(group.id || group._id)}
                    className={`px-4 py-2 font-bold text-sm rounded-xl border transition-colors ${
                      group.joined
                        ? 'bg-[#D9ECA2] text-[#7D9C6D] border-[#D9ECA2]'
                        : 'bg-gray-50 text-[#7D9C6D] border-gray-100 hover:bg-[#D9ECA2] hover:border-[#D9ECA2]'
                    }`}
                  >
                    {group.joined ? 'Joined' : 'Join'}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* MY SAFE CIRCLE VIEW */}
          {activeTab === 'circle' && (
            <motion.div key="circle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-extrabold text-gray-800 text-lg mb-1">Your Support Network</h2>
              <p className="text-sm text-gray-500 mb-4">People who care about your recovery journey.</p>

              {circle.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-semibold">No contacts in your circle yet.</p>
                  <p className="text-gray-300 text-sm mt-1">Add emergency contacts in your profile settings.</p>
                </div>
              )}

              {circle.map((member, idx) => (
                <div key={member.id || idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#EEF6DA] border-2 border-[#D9ECA2] flex items-center justify-center text-lg">
                        {member.hasAccount ? <UserCheck size={20} className="text-[#7D9C6D]" /> : <Users size={20} className="text-gray-400" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{member.name}</h4>
                        <p className="text-xs text-gray-500 font-medium capitalize mt-0.5">{member.role}</p>
                        {member.hasAccount && member.lastActive && (
                          <p className="text-[10px] text-[#7D9C6D] font-medium flex items-center gap-1 mt-1">
                            <Clock size={10} /> Active {new Date(member.lastActive).toLocaleDateString()}
                          </p>
                        )}
                        {member.hasAccount && !member.lastActive && (
                          <p className="text-[10px] text-[#7D9C6D] font-medium mt-1">Has an account</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="w-10 h-10 bg-[#EEF6DA] text-[#7D9C6D] rounded-xl flex items-center justify-center hover:bg-[#D9ECA2] transition-colors">
                          <Phone size={18} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="w-10 h-10 bg-[#EEF6DA] text-[#7D9C6D] rounded-xl flex items-center justify-center hover:bg-[#D9ECA2] transition-colors">
                          <Mail size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- COMPOSE NEW POST MODAL --- */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsComposeOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-[390px] rounded-t-[40px] sm:rounded-[40px] p-6 pb-12 relative z-10 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-gray-800">Share Experience</h2>
                <button onClick={() => setIsComposeOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-[#7D9C6D] shrink-0 flex items-center justify-center text-white text-xs font-bold">You</div>
                 <textarea 
                   autoFocus
                   value={newPostContent}
                   onChange={(e) => setNewPostContent(e.target.value)}
                   placeholder="What's on your mind? How are you feeling today?"
                   className="flex-1 min-h-[120px] bg-transparent resize-none focus:outline-none text-gray-700 placeholder:text-gray-400 text-lg leading-relaxed"
                 />
              </div>

              <button 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-[#7D9C6D] hover:bg-[#6b865d] disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md mt-4"
              >
                Post to Community
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}

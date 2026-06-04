import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useCommunityStore, useUserStore } from '../../store';
import { Post, StudyGroup, PostCategory } from '../../types';

type Tab = 'feed' | 'groups';
const CATEGORY_COLORS: Record<PostCategory, string> = {
  general: Colors.textMuted,
  study_help: Colors.info,
  resources: Colors.success,
  motivation: Colors.warning,
  events: Colors.notes,
};
const GROUP_ICONS = ['📚', '🔬', '🎨', '💻', '🧮', '🌍', '⚕️', '⚖️', '🎭', '🏛️'];
const GROUP_COLORS = ['#5B8A6F', '#6B8FBF', '#9B7FBF', '#E8A87C', '#E07070', '#7FBF9B'];

export const CommunityScreen: React.FC = () => {
  const { user } = useUserStore();
  const { groups, posts, joinedGroupIds, addGroup, joinGroup, leaveGroup, addPost, likePost, addComment, getFeedPosts, getGroupPosts } = useCommunityStore();

  const [tab, setTab] = useState<Tab>('feed');
  const [showNewPost, setShowNewPost] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);

  // Post form
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('general');

  // Group form
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupSubject, setGroupSubject] = useState('');
  const [groupIcon, setGroupIcon] = useState(GROUP_ICONS[0]);
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0]);

  // Comment form
  const [commentText, setCommentText] = useState('');

  const feedPosts = useMemo(() => getFeedPosts(), [posts]);
  const userId = user?.id ?? 'anonymous';
  const userName = user?.name ?? 'Anonymous';

  const handleAddPost = () => {
    if (!postContent.trim()) return;
    addPost({ authorId: userId, authorName: userName, content: postContent.trim(), category: postCategory, isPinned: false });
    setPostContent(''); setPostCategory('general');
    setShowNewPost(false);
  };

  const handleAddGroup = () => {
    if (!groupName.trim()) return;
    addGroup({ name: groupName.trim(), description: groupDesc, subject: groupSubject, icon: groupIcon, color: groupColor, isPublic: true, createdBy: userId }, userId, userName);
    setGroupName(''); setGroupDesc(''); setGroupSubject(''); setGroupIcon(GROUP_ICONS[0]); setGroupColor(GROUP_COLORS[0]);
    setShowNewGroup(false);
  };

  const handleComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    addComment(selectedPost.id, { postId: selectedPost.id, authorId: userId, authorName: userName, content: commentText.trim() });
    setCommentText('');
  };

  const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const liked = post.likes.includes(userId);
    return (
      <TouchableOpacity style={styles.postCard} onPress={() => setSelectedPost(post)}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>{post.authorName.charAt(0)}</Text>
          </View>
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthorName}>{post.authorName}</Text>
            <Text style={styles.postTime}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[post.category] + '20' }]}>
            <Text style={[styles.categoryText, { color: CATEGORY_COLORS[post.category] }]}>{post.category.replace('_', ' ')}</Text>
          </View>
        </View>
        <Text style={styles.postContent} numberOfLines={4}>{post.content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction} onPress={() => likePost(post.id, userId)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? Colors.error : Colors.textMuted} />
            <Text style={[styles.postActionText, liked && { color: Colors.error }]}>{post.likes.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.postActionText}>{post.comments.length}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => tab === 'feed' ? setShowNewPost(true) : setShowNewGroup(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {(['feed', 'groups'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'feed' ? 'Feed' : 'Study Groups'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {tab === 'feed' ? (
          feedPosts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>Be the first to share something!</Text>
            </View>
          ) : (
            feedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )
        ) : (
          groups.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No groups yet</Text>
              <Text style={styles.emptySub}>Create or join a study group</Text>
            </View>
          ) : (
            groups.map((group) => {
              const joined = joinedGroupIds.includes(group.id) || group.members.some((m) => m.userId === userId);
              return (
                <TouchableOpacity key={group.id} style={[styles.groupCard, { borderLeftColor: group.color }]} onPress={() => setSelectedGroup(group)}>
                  <View style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}>
                    <Text style={styles.groupIconText}>{group.icon}</Text>
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>{group.subject} · {group.members.length} members</Text>
                    {group.description ? <Text style={styles.groupDesc} numberOfLines={1}>{group.description}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.joinBtn, joined && styles.joinBtnJoined]}
                    onPress={() => joined ? leaveGroup(group.id, userId) : joinGroup(group.id, userId, userName)}
                  >
                    <Text style={[styles.joinBtnText, joined && styles.joinBtnTextJoined]}>{joined ? 'Leave' : 'Join'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* New Post Modal */}
      <Modal visible={showNewPost} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNewPost(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewPost(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity onPress={handleAddPost}><Text style={[styles.modalSave, !postContent.trim() && { opacity: 0.4 }]}>Post</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <TextInput
              style={[styles.input, styles.postInput]}
              placeholder="Share something with the community..."
              placeholderTextColor={Colors.textMuted}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              autoFocus
            />
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {(Object.keys(CATEGORY_COLORS) as PostCategory[]).map((cat) => (
                <TouchableOpacity key={cat} style={[styles.catBtn, postCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] + '25', borderColor: CATEGORY_COLORS[cat] }]} onPress={() => setPostCategory(cat)}>
                  <Text style={[styles.catBtnText, postCategory === cat && { color: CATEGORY_COLORS[cat] }]}>{cat.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* New Group Modal */}
      <Modal visible={showNewGroup} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNewGroup(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewGroup(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>New Study Group</Text>
            <TouchableOpacity onPress={handleAddGroup}><Text style={[styles.modalSave, !groupName.trim() && { opacity: 0.4 }]}>Create</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Group Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Organic Chemistry Study Group" placeholderTextColor={Colors.textMuted} value={groupName} onChangeText={setGroupName} autoFocus />
            <Text style={styles.fieldLabel}>Subject</Text>
            <TextInput style={styles.input} placeholder="e.g. Chemistry" placeholderTextColor={Colors.textMuted} value={groupSubject} onChangeText={setGroupSubject} />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={styles.input} placeholder="What's this group about?" placeholderTextColor={Colors.textMuted} value={groupDesc} onChangeText={setGroupDesc} />
            <Text style={styles.fieldLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {GROUP_ICONS.map((ic) => (
                <TouchableOpacity key={ic} style={[styles.iconBtn, groupIcon === ic && styles.iconBtnActive]} onPress={() => setGroupIcon(ic)}>
                  <Text style={styles.iconText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {GROUP_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, groupColor === c && styles.colorDotActive]} onPress={() => setGroupColor(c)} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Post Detail Modal */}
      {selectedPost && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedPost(null)}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedPost(null)}><Ionicons name="close" size={22} color={Colors.textSecondary} /></TouchableOpacity>
              <Text style={styles.modalTitle}>Post</Text>
              <View style={{ width: 22 }} />
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>{selectedPost.authorName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.postAuthorName}>{selectedPost.authorName}</Text>
                  <Text style={styles.postTime}>{formatDistanceToNow(new Date(selectedPost.createdAt), { addSuffix: true })}</Text>
                </View>
              </View>
              <Text style={styles.postContentFull}>{selectedPost.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction} onPress={() => { likePost(selectedPost.id, userId); setSelectedPost({ ...selectedPost, likes: selectedPost.likes.includes(userId) ? selectedPost.likes.filter((l) => l !== userId) : [...selectedPost.likes, userId] }); }}>
                  <Ionicons name={selectedPost.likes.includes(userId) ? 'heart' : 'heart-outline'} size={18} color={selectedPost.likes.includes(userId) ? Colors.error : Colors.textMuted} />
                  <Text style={styles.postActionText}>{selectedPost.likes.length} likes</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.fieldLabel}>Comments ({selectedPost.comments.length})</Text>
              {selectedPost.comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{c.authorName.charAt(0)}</Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{c.authorName}</Text>
                    <Text style={styles.commentText}>{c.content}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.commentInput}>
                <TextInput style={styles.commentField} placeholder="Add a comment..." placeholderTextColor={Colors.textMuted} value={commentText} onChangeText={setCommentText} />
                <TouchableOpacity style={[styles.commentSend, !commentText.trim() && { opacity: 0.4 }]} onPress={handleComment} disabled={!commentText.trim()}>
                  <Ionicons name="send" size={18} color={Colors.community} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, color: Colors.textPrimary, ...Typography.display },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.community, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  tab: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.community + '20', borderColor: Colors.community },
  tabText: { fontSize: 13, color: Colors.textSecondary, ...Typography.bodyMedium },
  tabTextActive: { color: Colors.community },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 18, color: Colors.textSecondary, ...Typography.heading, marginBottom: 6 },
  emptySub: { fontSize: 14, color: Colors.textMuted, ...Typography.body },
  postCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  postAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.community + '40', alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { fontSize: 16, color: Colors.community, ...Typography.bodySemiBold },
  postAuthorInfo: { flex: 1 },
  postAuthorName: { fontSize: 14, color: Colors.textPrimary, ...Typography.bodyMedium },
  postTime: { fontSize: 11, color: Colors.textMuted, ...Typography.body },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  categoryText: { fontSize: 10, ...Typography.bodyMedium, textTransform: 'capitalize' },
  postContent: { fontSize: 14, color: Colors.textSecondary, ...Typography.body, lineHeight: 20, marginBottom: Spacing.sm },
  postContentFull: { fontSize: 16, color: Colors.textSecondary, ...Typography.body, lineHeight: 24, marginBottom: Spacing.md },
  postActions: { flexDirection: 'row', gap: Spacing.md },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: 13, color: Colors.textMuted, ...Typography.body },
  groupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  groupIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  groupIconText: { fontSize: 22 },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 15, color: Colors.textPrimary, ...Typography.bodySemiBold },
  groupMeta: { fontSize: 12, color: Colors.textMuted, ...Typography.body, marginTop: 1 },
  groupDesc: { fontSize: 12, color: Colors.textSecondary, ...Typography.body, marginTop: 2 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.community, },
  joinBtnJoined: { backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  joinBtnText: { fontSize: 12, color: '#fff', ...Typography.bodySemiBold },
  joinBtnTextJoined: { color: Colors.textSecondary },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  modalCancel: { fontSize: 16, color: Colors.textSecondary, ...Typography.body },
  modalTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold },
  modalSave: { fontSize: 16, color: Colors.community, ...Typography.bodySemiBold },
  modalBody: { flex: 1, padding: Spacing.md },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  postInput: { height: 140, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  catBtnText: { fontSize: 12, color: Colors.textSecondary, ...Typography.bodyMedium, textTransform:
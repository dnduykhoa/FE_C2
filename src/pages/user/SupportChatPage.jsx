import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConversationApi,
  getConversationMessagesApi,
  getMyConversationsApi,
  markConversationReadApi,
  sendCustomerMessageApi
} from '../../services/messages.api';
import DataStatePanel from '../../components/common/DataStatePanel';

const defaultTicketForm = {
  subject: '',
  priority: 'normal',
  content: ''
};

function getSupportStatusLabel(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'open') return 'Mới mở';
  if (value === 'pending') return 'Đang xử lý';
  if (value === 'resolved') return 'Đã xử lý';
  if (value === 'closed') return 'Đã đóng';
  return status || 'Không xác định';
}

function getPriorityLabel(priority) {
  const value = String(priority || '').toLowerCase();
  if (value === 'low') return 'Thấp';
  if (value === 'normal') return 'Bình thường';
  if (value === 'high') return 'Cao';
  if (value === 'urgent') return 'Khẩn cấp';
  return priority || 'Không xác định';
}

function isDocumentVisible() {
  if (typeof document === 'undefined') {
    return true;
  }
  return document.visibilityState === 'visible';
}

export default function SupportChatPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [ticketForm, setTicketForm] = useState(defaultTicketForm);
  const [messageContent, setMessageContent] = useState('');
  const [expandedMessages, setExpandedMessages] = useState({});

  const conversationsQuery = useQuery({
    queryKey: ['support', 'my-conversations'],
    queryFn: () => getMyConversationsApi({ page: 1, limit: 30 }),
    refetchInterval: () => (isDocumentVisible() ? 15000 : false)
  });

  const conversationsResult = conversationsQuery.data;
  const conversations = conversationsResult?.ok ? (conversationsResult?.data?.items || []) : [];

  const activeConversationId = useMemo(() => {
    if (selectedConversationId) {
      return selectedConversationId;
    }
    return conversations[0]?._id || conversations[0]?.id || '';
  }, [conversations, selectedConversationId]);

  const messagesQuery = useQuery({
    queryKey: ['support', 'messages', activeConversationId],
    queryFn: () => getConversationMessagesApi(activeConversationId, { page: 1, limit: 100 }),
    enabled: Boolean(activeConversationId),
    refetchInterval: () => (activeConversationId && isDocumentVisible() ? 5000 : false)
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversationApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo yêu cầu hỗ trợ');
        return;
      }
      toast.success('Đã tạo yêu cầu hỗ trợ');
      setTicketForm(defaultTicketForm);
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['support', 'my-conversations'] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, payload }) => sendCustomerMessageApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể gửi tin nhắn');
        return;
      }
      toast.success('Đã gửi tin nhắn');
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['support', 'my-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'messages', activeConversationId] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: markConversationReadApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể đánh dấu đã đọc');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['support', 'my-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'messages', activeConversationId] });
    }
  });

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    markReadMutation.mutate(activeConversationId);
  }, [activeConversationId]);

  function handleCreateTicket(event) {
    event.preventDefault();
    const normalizedSubject = ticketForm.subject.trim();
    const normalizedContent = ticketForm.content.trim();
    if (!normalizedSubject || !normalizedContent) {
      toast.error('Vui lòng nhập chủ đề và nội dung ticket');
      return;
    }
    if (normalizedSubject.length > 200) {
      toast.error('Chủ đề hỗ trợ tối đa 200 ký tự');
      return;
    }
    if (normalizedContent.length > 2000) {
      toast.error('Nội dung hỗ trợ tối đa 2000 ký tự');
      return;
    }

    createConversationMutation.mutate({
      subject: normalizedSubject,
      priority: ticketForm.priority,
      content: normalizedContent
    });
  }

  function handleSendMessage(event) {
    event.preventDefault();
    if (!activeConversationId) {
      toast.error('Vui lòng chọn hội thoại');
      return;
    }
    if (!messageContent.trim()) {
      toast.error('Nội dung tin nhắn không được bỏ trống');
      return;
    }

    sendMessageMutation.mutate({
      id: activeConversationId,
      payload: { content: messageContent.trim() }
    });
  }

  const messagesResult = messagesQuery.data;
  const messages = messagesResult?.ok ? (messagesResult?.data?.items || []) : [];
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime()),
    [messages]
  );
  const activeConversation = useMemo(
    () => conversations.find((conversation) => (conversation._id || conversation.id) === activeConversationId) || null,
    [conversations, activeConversationId]
  );
  const isConversationClosed = activeConversation?.status === 'closed';

  function isLongMessage(content) {
    return String(content || '').length > 1200;
  }

  function toggleExpandedMessage(messageId) {
    setExpandedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  }

  return (
    <section className="stack-gap">
      {showCreateForm ? (
        <section className="paper-block stack-gap">
          <h1>Tạo yêu cầu hỗ trợ</h1>
          <form className="stack-gap" onSubmit={handleCreateTicket}>
            <input
              type="text"
              placeholder="Chủ đề hỗ trợ"
              value={ticketForm.subject}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, subject: event.target.value }))}
            />
            <select value={ticketForm.priority} onChange={(event) => setTicketForm((prev) => ({ ...prev, priority: event.target.value }))}>
              <option value="low">Ưu tiên thấp</option>
              <option value="normal">Ưu tiên bình thường</option>
              <option value="high">Ưu tiên cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
            <textarea
              rows={4}
              placeholder="Nội dung vấn đề cần hỗ trợ"
              value={ticketForm.content}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, content: event.target.value }))}
            />
            <div className="hero-actions">
              <button className="btn primary" type="submit" disabled={createConversationMutation.isPending}>
                Tạo yêu cầu
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setTicketForm(defaultTicketForm);
                  setShowCreateForm(false);
                }}
              >
                Đóng form
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Hội thoại hỗ trợ của tôi</h2>
          {!showCreateForm ? (
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowCreateForm(true)}
            >
              Tạo yêu cầu
            </button>
          ) : null}
        </div>
        <div className="admin-access-grid support-chat-layout">
          <div className="orders-list support-conversation-list">
            {conversationsQuery.isLoading ? (
              <DataStatePanel type="loading" title="Đang tải hội thoại" message="Hệ thống đang lấy danh sách ticket của bạn." />
            ) : null}
            {!conversationsQuery.isLoading && conversationsResult && !conversationsResult.ok ? (
              <DataStatePanel
                type="error"
                title="Không tải được hội thoại"
                message={conversationsResult.message}
                onRetry={() => conversationsQuery.refetch()}
              />
            ) : null}
            {!conversationsQuery.isLoading && conversationsResult?.ok && conversations.length === 0 ? (
              <DataStatePanel
                type="empty"
                title="Chưa có yêu cầu hỗ trợ"
                message="Bấm nút Tạo yêu cầu để bắt đầu hội thoại mới."
                onRetry={() => conversationsQuery.refetch()}
              />
            ) : null}
            {conversations.map((conversation) => {
              const conversationId = conversation._id || conversation.id;
              const isActive = conversationId === activeConversationId;
              const formattedLastMessageAt = conversation.lastMessageAt
                ? dayjs(conversation.lastMessageAt).format('DD/MM/YYYY HH:mm')
                : '-';
              return (
                <button
                  key={conversationId}
                  type="button"
                  className={`support-conversation-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedConversationId(conversationId);
                    markReadMutation.mutate(conversationId);
                  }}
                >
                  <strong>{conversation.subject}</strong>
                  <span>{getSupportStatusLabel(conversation.status)} · {getPriorityLabel(conversation.priority)}</span>
                  <small>{dayjs(conversation.lastMessageAt).format('DD/MM/YYYY HH:mm')}</small>
                  {conversation.unreadCountForCustomer ? <em>{conversation.unreadCountForCustomer} tin chưa đọc</em> : null}
                  <div className="support-conversation-row">
                    <strong className="support-conversation-title">{conversation.subject}</strong>
                    <small className="support-conversation-time">{formattedLastMessageAt}</small>
                  </div>
                  <div className="support-conversation-row support-conversation-meta">
                    <span className="support-meta-pill">{conversation.status}</span>
                    <span className="support-meta-pill">{conversation.priority}</span>
                    {conversation.unreadCountForCustomer ? <em className="support-unread-badge">{conversation.unreadCountForCustomer}</em> : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="paper-block stack-gap support-chat-panel" style={{ marginBottom: 0 }}>
            <div className="support-chat-header">
              <h3>Chi tiết hội thoại</h3>
              {activeConversation ? (
                <div className="support-chat-meta-row">
                  <span className="status-badge status-pending">{activeConversation.status}</span>
                  <span className="status-badge status-success">{activeConversation.priority}</span>
                </div>
              ) : null}
            </div>
            {!activeConversationId ? <p>Hãy chọn hoặc tạo một hội thoại hỗ trợ.</p> : null}
            {activeConversationId ? (
              <>
                <div className="support-message-list">
                  {messagesQuery.isLoading ? (
                    <DataStatePanel type="loading" title="Đang tải tin nhắn" message="Tin nhắn của hội thoại đang được đồng bộ." />
                  ) : null}
                  {!messagesQuery.isLoading && messagesResult && !messagesResult.ok ? (
                    <DataStatePanel
                      type="error"
                      title="Không tải được tin nhắn"
                      message={messagesResult.message}
                      onRetry={() => messagesQuery.refetch()}
                    />
                  ) : null}
                  {!messagesQuery.isLoading && messagesResult?.ok && messages.length === 0 ? (
                    <DataStatePanel
                      type="empty"
                      title="Chưa có tin nhắn"
                      message="Hãy gửi tin nhắn đầu tiên để bắt đầu trao đổi với bộ phận hỗ trợ."
                      onRetry={() => messagesQuery.refetch()}
                    />
                  ) : null}
                  {sortedMessages.map((message) => {
                    const messageId = message._id || message.id;
                    const isMine = message.senderRole === 'customer';
                    const shouldCollapse = isLongMessage(message.content);
                    const isExpanded = Boolean(expandedMessages[messageId]);
                    return (
                      <article key={messageId} className={`support-message-item ${isMine ? 'mine' : 'admin'}`}>
                        <span className="support-message-role">{isMine ? 'Bạn' : 'Hỗ trợ viên'}</span>
                        <p className={shouldCollapse && !isExpanded ? 'support-message-clamped' : ''}>{message.content}</p>
                        {shouldCollapse ? (
                          <button
                            type="button"
                            className="support-toggle-btn"
                            onClick={() => toggleExpandedMessage(messageId)}
                          >
                            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                          </button>
                        ) : null}
                        <small>{dayjs(message.createdAt).format('DD/MM/YYYY HH:mm')}</small>
                      </article>
                    );
                  })}
                </div>
                <form className="stack-gap" onSubmit={handleSendMessage}>
                  <textarea
                    rows={3}
                    placeholder="Nhập tin nhắn của bạn"
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    disabled={isConversationClosed}
                  />
                  <div className="hero-actions">
                    <button className="btn primary" type="submit" disabled={sendMessageMutation.isPending || isConversationClosed}>
                      Gửi tin nhắn
                    </button>
                    <button className="btn secondary" type="button" onClick={() => markReadMutation.mutate(activeConversationId)}>
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  {isConversationClosed ? <small className="muted-text">Ticket đã đóng, bạn không thể gửi thêm tin nhắn.</small> : null}
                </form>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}

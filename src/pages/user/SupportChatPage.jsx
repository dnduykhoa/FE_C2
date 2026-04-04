import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
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

export default function SupportChatPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [ticketForm, setTicketForm] = useState(defaultTicketForm);
  const [messageContent, setMessageContent] = useState('');

  const conversationsQuery = useQuery({
    queryKey: ['support', 'my-conversations'],
    queryFn: () => getMyConversationsApi({ page: 1, limit: 30 })
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
    enabled: Boolean(activeConversationId)
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

  function handleCreateTicket(event) {
    event.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.content.trim()) {
      toast.error('Vui lòng nhập chủ đề và nội dung yêu cầu');
      return;
    }

    createConversationMutation.mutate({
      subject: ticketForm.subject.trim(),
      priority: ticketForm.priority,
      content: ticketForm.content.trim()
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
        <div className="admin-access-grid">
          <div className="orders-list">
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
                </button>
              );
            })}
          </div>

          <div className="paper-block stack-gap" style={{ marginBottom: 0 }}>
            <h3>Chi tiết hội thoại</h3>
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
                  {messages.map((message) => {
                    const messageId = message._id || message.id;
                    const isMine = message.senderRole === 'customer';
                    return (
                      <article key={messageId} className={`support-message-item ${isMine ? 'mine' : 'admin'}`}>
                        <p>{message.content}</p>
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
                  />
                  <div className="hero-actions">
                    <button className="btn primary" type="submit" disabled={sendMessageMutation.isPending}>
                      Gửi tin nhắn
                    </button>
                    <button className="btn secondary" type="button" onClick={() => markReadMutation.mutate(activeConversationId)}>
                      Đánh dấu đã đọc
                    </button>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}

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

const defaultTicketForm = {
  subject: '',
  priority: 'normal',
  content: ''
};

export default function SupportChatPage() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [ticketForm, setTicketForm] = useState(defaultTicketForm);
  const [messageContent, setMessageContent] = useState('');

  const conversationsQuery = useQuery({
    queryKey: ['support', 'my-conversations'],
    queryFn: () => getMyConversationsApi({ page: 1, limit: 30 })
  });

  const conversations = conversationsQuery.data?.data?.items || [];

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
        toast.error(result.message || 'Không thể tạo ticket hỗ trợ');
        return;
      }
      toast.success('Đã tạo ticket hỗ trợ');
      setTicketForm(defaultTicketForm);
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
      toast.error('Vui lòng nhập chủ đề và nội dung ticket');
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

  const messages = messagesQuery.data?.data?.items || [];

  return (
    <section className="stack-gap">
      <section className="paper-block stack-gap">
        <h1>Tạo ticket hỗ trợ</h1>
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
              Tạo ticket
            </button>
          </div>
        </form>
      </section>

      <section className="paper-block stack-gap">
        <h2>Hội thoại hỗ trợ của tôi</h2>
        <div className="admin-access-grid">
          <div className="orders-list">
            {conversationsQuery.isLoading ? <p>Đang tải hội thoại...</p> : null}
            {!conversationsQuery.isLoading && conversations.length === 0 ? <p>Bạn chưa có hội thoại hỗ trợ nào.</p> : null}
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
                  <span>{conversation.status} · {conversation.priority}</span>
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

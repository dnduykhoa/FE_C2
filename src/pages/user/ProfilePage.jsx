import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { changeMyPasswordApi, updateMyProfileApi, uploadMyAvatarApi } from '../../services/auth.api';
import { useAuthStore } from '../../store/authStore';

function formatDateInput(value) {
  if (!value) {
    return '';
  }

  return dayjs(value).format('YYYY-MM-DD');
}

const initialProfileForm = {
  fullName: '',
  birthday: ''
};

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || '',
      birthday: formatDateInput(user?.birthday)
    });
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfileApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật hồ sơ');
        return;
      }

      toast.success('Đã cập nhật hồ sơ');
      setAuth({ token, user: result.data });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: changeMyPasswordApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể đổi mật khẩu');
        return;
      }

      toast.success('Đã đổi mật khẩu');
      setPasswordForm(initialPasswordForm);
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadMyAvatarApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tải ảnh đại diện');
        return;
      }

      toast.success('Đã tải ảnh đại diện');
      setAuth({ token, user: result.data });
    }
  });

  function handleProfileSubmit(event) {
    event.preventDefault();

    updateProfileMutation.mutate({
      fullName: profileForm.fullName.trim(),
      birthday: profileForm.birthday ? `${profileForm.birthday}T00:00:00.000Z` : null
    });
  }

  function handleAvatarFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    if (!nextFile) {
      return;
    }

    uploadAvatarMutation.mutate(nextFile);
    event.target.value = '';
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu mới');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    });
  }

  return (
    <section className="stack-gap">
      <section className="paper-block stack-gap profile-account-panel">
        <div>
          <h1>Hồ sơ tài khoản</h1>
        </div>

        <div className="profile-avatar-wrap">
          <img
            className="profile-avatar-preview"
            src={user?.avatarUrl || 'https://i.sstatic.net/l60Hf.png'}
            alt="Ảnh đại diện"
          />
          <label className="avatar-camera-btn" htmlFor="avatarFileInput" aria-label="Thay đổi ảnh đại diện">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </label>
          <input
            id="avatarFileInput"
            type="file"
            accept="image/*"
            className="avatar-file-input"
            onChange={handleAvatarFileChange}
            disabled={uploadAvatarMutation.isPending}
          />
        </div>

        <div className="profile-details-vertical">
          <div className="profile-detail-row">
            <label>Tên đăng nhập</label>
            <p>{user?.username || '-'}</p>
          </div>
          <div className="profile-detail-row">
            <label>Họ tên</label>
            <p>{user?.fullName || '-'}</p>
          </div>
          <div className="profile-detail-row">
            <label>Email</label>
            <p>{user?.email || '-'}</p>
          </div>
          <div className="profile-detail-row">
            <label>Trạng thái</label>
            <p>{user?.status ? 'Đang hoạt động' : 'Đang bị khóa'}</p>
          </div>
          <div className="profile-detail-row">
            <label>Số lần đăng nhập</label>
            <p>{user?.loginCount ?? 0}</p>
          </div>
          <div className="profile-detail-row">
            <label>Ngày sinh</label>
            <p>{user?.birthday ? dayjs(user.birthday).format('DD/MM/YYYY') : '-'}</p>
          </div>
        </div>
        <div className="profile-action-row">
          <button
            className="btn secondary"
            type="button"
            onClick={() => setActiveSection((prev) => (prev === 'profile' ? '' : 'profile'))}
          >
            Cập nhật hồ sơ
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => setActiveSection((prev) => (prev === 'password' ? '' : 'password'))}
          >
            Đổi mật khẩu
          </button>
        </div>

        {activeSection === 'profile' ? (
          <form className="stack-gap profile-form-panel" onSubmit={handleProfileSubmit}>
            <div className="form-grid">
              <label htmlFor="fullName">Họ tên</label>
              <input
                id="fullName"
                type="text"
                value={profileForm.fullName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="form-grid">
              <label htmlFor="birthday">Ngày sinh</label>
              <input
                id="birthday"
                type="date"
                value={profileForm.birthday}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, birthday: event.target.value }))}
              />
            </div>

            <div className="hero-actions">
              <button className="btn primary" type="submit" disabled={updateProfileMutation.isPending}>
                Lưu thay đổi hồ sơ
              </button>
            </div>
          </form>
        ) : null}

        {activeSection === 'password' ? (
          <form className="stack-gap profile-form-panel" onSubmit={handlePasswordSubmit}>
            <div className="form-grid">
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                placeholder="Để trống nếu tài khoản chưa có mật khẩu"
              />
            </div>

            <div className="form-grid">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div className="form-grid">
              <label htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <div className="hero-actions">
              <button className="btn primary" type="submit" disabled={changePasswordMutation.isPending}>
                Xác nhận đổi mật khẩu
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </section>
  );
}

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
  const [avatarFile, setAvatarFile] = useState(null);

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
      setAvatarFile(null);
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

  function handleAvatarUpload(event) {
    event.preventDefault();

    if (!avatarFile) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    uploadAvatarMutation.mutate(avatarFile);
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
      <section className="paper-block stack-gap">
        <div>
          <h1>Hồ sơ tài khoản</h1>
          <p className="muted-text">Tên đăng nhập và email đang được giữ ở chế độ chỉ đọc.</p>
        </div>

        <div className="profile-grid">
          <div>
            <label>Tên đăng nhập</label>
            <p>{user?.username || '-'}</p>
          </div>
          <div>
            <label>Email</label>
            <p>{user?.email || '-'}</p>
          </div>
          <div>
            <label>Trạng thái</label>
            <p>{user?.status ? 'Đang hoạt động' : 'Đang bị khóa'}</p>
          </div>
          <div>
            <label>Số lần đăng nhập</label>
            <p>{user?.loginCount ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="paper-block stack-gap">
        <h2>Chỉnh sửa hồ sơ</h2>
        <div className="profile-avatar-panel">
          <img
            className="profile-avatar-preview"
            src={user?.avatarUrl || 'https://i.sstatic.net/l60Hf.png'}
            alt="Ảnh đại diện"
          />
          <form className="stack-gap" onSubmit={handleAvatarUpload}>
            <div className="form-grid">
              <label htmlFor="avatarFile">Tải ảnh đại diện</label>
              <input
                id="avatarFile"
                type="file"
                accept="image/*"
                onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              />
            </div>
            <div className="hero-actions">
              <button className="btn secondary" type="submit" disabled={uploadAvatarMutation.isPending}>
                Tải ảnh lên
              </button>
            </div>
          </form>
        </div>

        <p className="muted-text">Ảnh đại diện được cập nhật qua thao tác tải file, không chỉnh bằng URL thủ công.</p>

        <form className="stack-gap" onSubmit={handleProfileSubmit}>
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
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </section>

      <section className="paper-block stack-gap">
        <h2>Đổi mật khẩu</h2>
        <form className="stack-gap" onSubmit={handlePasswordSubmit}>
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
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

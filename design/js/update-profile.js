// Profile picture update logic
document.addEventListener('DOMContentLoaded', function() {
  const changePhotoBtn = document.querySelector('.change-photo-btn');
  const profileUpload = document.getElementById('profile-upload');
  const profileImg = document.querySelector('.profile-img');

  if (changePhotoBtn && profileUpload && profileImg) {
    changePhotoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      profileUpload.click();
    });

    profileUpload.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          profileImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  document.querySelector('.update-btn').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Profile updated successfully!');
  });

  document.querySelector('.cancel-btn').addEventListener('click', function() {
    window.location.href = 'profile.html';
  });
});
// Function to show notification
export function showNotification(type, message) {
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  notificationContainer.innerHTML = `
      <div class="notification is-${type}">
        <button class="delete"></button>
        ${message}
      </div>
    `;
  notificationContainer.style.display = "block";

  // Add event listener to delete button to close the notification
  const deleteButton = notificationContainer.querySelector(".delete");
  deleteButton.addEventListener("click", () => {
    notificationContainer.style.display = "none";
  });
}

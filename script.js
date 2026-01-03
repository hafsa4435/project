document.addEventListener("DOMContentLoaded", () => {
  const examContainer = document.getElementById('examContainer');
  const addExamBtn = document.getElementById('addExamBtn');

  addExamBtn.addEventListener('click', () => {
    const examDiv = document.createElement('div');
    examDiv.className = 'exam-block';

    examDiv.innerHTML = `
      <label>Subject Name:</label>
      <input type="text" class="subject-name" placeholder="e.g. Chemistry" />

      <label>Exam Date:</label>
      <input type="date" class="exam-date" />

      <label>Difficulty Level:</label>
      <select class="subject-difficulty">
        <option value="easy">🟢 Easy</option>
        <option value="medium" selected>🟡 Medium</option>
        <option value="hard">🔴 Hard</option>
      </select>

      <label>Topics (one per line):</label>
      <textarea class="subject-topics" placeholder="e.g.\nAtomic Structure\nThermodynamics"></textarea>
    `;

    examContainer.appendChild(examDiv);
  });

  // Add one exam block by default
  addExamBtn.click();
});

function generateSmartSchedule() {
  const exams = document.querySelectorAll('.exam-block');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let allStudyTasks = {};

  for (let exam of exams) {
    const subject = exam.querySelector('.subject-name').value.trim();
    const dateStr = exam.querySelector('.exam-date').value;
    const difficulty = exam.querySelector('.subject-difficulty').value;
    const topicsText = exam.querySelector('.subject-topics').value.trim();

    if (!subject || !dateStr || !topicsText) {
      alert('Please fill in all fields for each exam.');
      return;
    }

    const examDate = new Date(dateStr);
    examDate.setHours(0, 0, 0, 0);

    if (examDate <= today) {
      alert('Exam dates must be in the future.');
      return;
    }

    const daysUntilExam = Math.floor((examDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExam < 3) {
      alert(`Not enough days to schedule ${subject}. At least 3 days needed for revision.`);
      return;
    }

    // Difficulty weighting
    let weight = 1;
    if (difficulty === "medium") weight = 1.5;
    else if (difficulty === "hard") weight = 2;

    const topics = topicsText.split('\n').map(t => t.trim()).filter(t => t);
    const studyDays = Math.max(1, Math.ceil((daysUntilExam - 2) * (weight / 2))); // reserve last 2 days for revision
    const topicsPerDay = Math.ceil(topics.length / studyDays);

    let topicIndex = 0;

    // Schedule study (before revision days)
    for (let d = 0; d < studyDays && topicIndex < topics.length; d++) {
      const studyDate = new Date(today);
      studyDate.setDate(today.getDate() + d);
      const dateKey = studyDate.toISOString().split('T')[0];

      if (!allStudyTasks[dateKey]) allStudyTasks[dateKey] = [];

      const dayTopics = topics.slice(topicIndex, topicIndex + topicsPerDay);
      topicIndex += topicsPerDay;

      allStudyTasks[dateKey].push({
        subject,
        topics: dayTopics
      });
    }

    // Schedule revision (last 2 days before exam)
    for (let r = 2; r > 0; r--) {
      const revisionDate = new Date(examDate);
      revisionDate.setDate(examDate.getDate() - r);
      const dateKey = revisionDate.toISOString().split('T')[0];

      if (!allStudyTasks[dateKey]) allStudyTasks[dateKey] = [];

      allStudyTasks[dateKey].push({
        subject,
        topics: ['🔁 Revision']
      });
    }
  }

  // Display Schedule
  const scheduleList = document.getElementById('scheduleList');
  scheduleList.innerHTML = '';

  const sortedDates = Object.keys(allStudyTasks).sort();

  for (let dateStr of sortedDates) {
    const li = document.createElement('li');
    const dateObj = new Date(dateStr);
    const dateText = dateObj.toDateString();

    let content = `<strong>${dateText}</strong><br/>`;

    allStudyTasks[dateStr].forEach(entry => {
      content += `<em>${entry.subject}</em>: ${entry.topics.join(', ')}<br>`;
    });

    li.innerHTML = content;
    scheduleList.appendChild(li);
  }
}


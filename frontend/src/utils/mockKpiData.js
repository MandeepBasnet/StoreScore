export const getDaysForMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let i = 1; i <= daysInMonth; i++) {
    // Stop if we are generating future days for current month
    if (isCurrentMonth && i > currentDay) break;

    const dateObj = new Date(year, month, i);
    const dayOfWeek = dayNames[dateObj.getDay()];
    const monthName = monthNames[month];
    
    // Status Logic
    let status = 'locked';
    let score = (28 + Math.random() * 2).toFixed(1); // Random score 28.0 - 30.0

    // If it's the current month, make the last 2 days pending for demo
    if (isCurrentMonth) {
      if (i === currentDay || i === currentDay - 1) {
        status = 'pending';
        score = undefined;
      }
    }

    days.push({
      id: `${year}-${month}-${i}`,
      date: dayOfWeek,
      fullDate: `${dayOfWeek.slice(0, 3)}, ${monthName} ${i}`,
      status: status,
      score: score,
      target: 28.0
    });
  }

  // Return reversed array (newest first)
  return days.reverse();
};

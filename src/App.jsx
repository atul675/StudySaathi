import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen, CalendarDays, ChartNoAxesCombined, Check, CheckCircle2, ChevronRight,
  Circle, Clock3, Flame, GraduationCap, LayoutDashboard, ListTodo, Menu, Plus,
  Sparkles, Target, Timer, Trash2, Trophy, X, Brain, Coffee, RotateCcw
} from "lucide-react";

const starterTasks = [];

const quizQuestions = [
  { q: "Which HTML element is used for the main page heading?", options: ["<head>", "<h1>", "<title>", "<header>"], answer: 1, explanation: "The h1 element represents the highest-level heading on a page." },
  { q: "Which JavaScript method adds an item to the end of an array?", options: ["shift()", "pop()", "push()", "slice()"], answer: 2, explanation: "push() adds one or more elements to the end of an array." },
  { q: "What does CSS primarily control?", options: ["Page styling and layout", "Database storage", "Server authentication", "API routing"], answer: 0, explanation: "CSS controls presentation, styling, and layout of web pages." },
  { q: "Which SQL command retrieves data from a table?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"], answer: 2, explanation: "SELECT queries data from one or more database tables." },
  { q: "What is the purpose of an API?", options: ["Compress images only", "Let software systems communicate", "Style a button", "Store passwords in plain text"], answer: 1, explanation: "An API defines how software components can communicate with each other." }
];

const initialSubjects = [
  { id: 1, name: "Web Development", color: "mint", topics: 12 },
  { id: 2, name: "Data Structures", color: "lilac", topics: 18 },
  { id: 3, name: "DBMS", color: "peach", topics: 10 },
];

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [active, setActive] = useState("Overview");
  const [tasks, setTasks] = useState(() =>
  load("ss-tasks", starterTasks).filter(
    (task) => ![1, 2, 3].includes(task.id)
  )
);
  const [subjects, setSubjects] = useState(() => load("ss-subjects", initialSubjects));
  const [examDate, setExamDate] = useState(() => load("ss-exam-date", ""));
  const [dailyGoal, setDailyGoal] = useState(() => load("ss-goal", 3));
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("Web Development");
  const [taskMinutes, setTaskMinutes] = useState("30");
  const [subjectName, setSubjectName] = useState("");
  const [subjectTopics, setSubjectTopics] = useState("10");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizTopic, setQuizTopic] = useState("");
const [aiQuestions, setAiQuestions] = useState([]);
const [quizLoading, setQuizLoading] = useState(false);
const [quizError, setQuizError] = useState("");
const [flashcards, setFlashcards] = useState([]);
const [flashcardTopic, setFlashcardTopic] = useState("");
const [flashcardLoading, setFlashcardLoading] = useState(false);
const [flashcardError, setFlashcardError] = useState("");
const [flashcardIndex, setFlashcardIndex] = useState(0);
const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizHistory, setQuizHistory] = useState(() => load("ss-quiz-history", []));
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [plannerHours, setPlannerHours] = useState(3);
  const [plannerExam, setPlannerExam] = useState("");
  const [plannerSubjects, setPlannerSubjects] = useState("Web Development, DSA, DBMS");
  const [generatedPlan, setGeneratedPlan] = useState([]);
  const generateAIQuiz = async () => {
    if (!quizTopic.trim()) {
      setQuizError("Please enter a topic first.");
      return;
    }

    setQuizLoading(true);
    setQuizError("");

    try {
      const response = await fetch("http://localhost:3001/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: quizTopic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Quiz generation failed.");
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("The AI server did not return any questions.");
      }

      setAiQuestions(data.questions);
      setQuizIndex(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } catch (error) {
      setQuizError(error.message || "Could not connect to the AI server.");
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => localStorage.setItem("ss-tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("ss-subjects", JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem("ss-exam-date", JSON.stringify(examDate)), [examDate]);
  useEffect(() => localStorage.setItem("ss-goal", JSON.stringify(dailyGoal)), [dailyGoal]);
  useEffect(() => localStorage.setItem("ss-quiz-history", JSON.stringify(quizHistory)), [quizHistory]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);
          setToast("Focus session complete. Great work!");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const completed = tasks.filter((task) => task.done).length;
  const taskProgress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const totalMinutes = tasks.filter((task) => !task.done).reduce((sum, task) => sum + Number(task.minutes || 0), 0);
  const daysUntilExam = useMemo(() => {
    if (!examDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate + "T00:00:00");
    return Math.ceil((exam - today) / 86400000);
  }, [examDate]);

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Study Planner", icon: CalendarDays },
    { name: "My Tasks", icon: ListTodo },
    { name: "Quiz Practice", icon: Brain },
    { name: "Flashcards", icon: BookOpen },
    { name: "Focus Room", icon: Timer },
  ];

  function addTask(event) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    setTasks((current) => [...current, {
      id: Date.now(), title: taskTitle.trim(), subject: taskSubject,
      minutes: Math.max(5, Number(taskMinutes) || 30), done: false
    }]);
    setTaskTitle(""); setShowTaskForm(false); setToast("Study task added!");
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setToast("Task removed.");
  }

  function addSubject(event) {
    event.preventDefault();
    if (!subjectName.trim()) return;
    setSubjects((current) => [...current, {
      id: Date.now(), name: subjectName.trim(), color: ["mint", "lilac", "peach", "blue"][current.length % 4],
      topics: Math.max(1, Number(subjectTopics) || 10)
    }]);
    setSubjectName(""); setSubjectTopics("10"); setShowSubjectForm(false); setToast("Subject added!");
  }

  function generatePlan(event) {
    event.preventDefault();
    const list = plannerSubjects.split(",").map((s) => s.trim()).filter(Boolean);
    if (!list.length) return;
    const hours = Math.max(1, Number(plannerHours) || 1);
    const slots = Math.max(1, Math.floor((hours * 60) / 45));
    const plan = Array.from({ length: slots }, (_, i) => ({
      subject: list[i % list.length],
      duration: i === slots - 1 ? Math.max(15, hours * 60 - (slots - 1) * 45) : 45,
      type: i % 3 === 2 ? "Practice & recall" : i % 3 === 1 ? "Active revision" : "Learn a topic"
    }));
    setGeneratedPlan(plan);
    setToast("Your draft plan is ready. Adjust it to your needs.");
  }

  function resetQuiz() {
    setQuizIndex(0); setQuizAnswers({}); setQuizSubmitted(false);
  }

  function finishQuiz() {
    const score = currentQuizQuestions.filter((q, i) => quizAnswers[i] === q.answer).length;
    const record = {
      id: Date.now(),
      topic: aiQuestions.length ? (quizTopic.trim() || "AI quiz") : "Web & CS basics",
      score,
      total: currentQuizQuestions.length,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    setQuizHistory((current) => [record, ...current].slice(0, 20));
    setQuizSubmitted(true);
  }

  function retryWrongAnswers() {
    const wrongQuestions = currentQuizQuestions.filter((q, i) => quizAnswers[i] !== q.answer);
    if (!wrongQuestions.length) {
      setToast("Perfect score! No wrong answers to retry.");
      return;
    }
    setAiQuestions(wrongQuestions);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setToast(`Starting practice with ${wrongQuestions.length} missed question(s).`);
  }

  function changeTimer(value) {
    const mins = Number(value);
    setTimerMinutes(mins); setSecondsLeft(mins * 60); setTimerRunning(false);
  }

  const timeLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const currentQuizQuestions = aiQuestions.length > 0 ? aiQuestions : quizQuestions;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={23} /></div>
          <div><strong>StudySaathi</strong><span>YOUR LEARNING SPACE</span></div>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19}/></button>
        </div>
        <div className="nav-label">MENU</div>
        <nav className="side-nav">
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${active === name ? "active" : ""}`} onClick={() => { setActive(name); setMobileNav(false); }}>
              <Icon size={19}/><span>{name}</span>{active === name && <span className="nav-dot"/>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quote-card">
            <div className="quote-icon"><Sparkles size={17}/></div>
            <strong>Small steps. Big progress.</strong>
            <p>Consistency beats last-minute cramming. Keep showing up.</p>
          </div>
          <div className="profile-row">
            <div className="avatar">S</div><div className="profile-copy"><strong>Student workspace</strong><span>Your progress stays on this device</span></div>
          </div>
        </div>
      </aside>

      {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={15}/><strong>{active}</strong></div>
          <div className="topbar-right"><div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div><div className="avatar avatar-small">S</div></div>
        </header>

        <div className="page-content">
          {active === "Overview" && (
            <>
              <section className="welcome-row">
                <div><div className="eyebrow"><Sparkles size={15}/> YOUR PERSONAL STUDY SPACE</div><h1>Make today <span>count.</span></h1><p>A little progress every day adds up. Ready to learn something new?</p></div>
                <button className="primary-button" onClick={() => { setActive("My Tasks"); setShowTaskForm(true); }}><Plus size={18}/> Add a study task</button>
              </section>

              <section className="stats-grid">
                <StatCard icon={ListTodo} label="Tasks completed" value={`${completed}/${tasks.length}`} detail={`${taskProgress}% of your task list`} tone="mint" progress={taskProgress}/>
                <StatCard icon={Clock3} label="Planned study time" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} detail="Time remaining in open tasks" tone="lilac"/>
                <StatCard icon={Flame} label="Daily study goal" value={`${Math.min(completed, dailyGoal)}/${dailyGoal}`} detail="Tasks toward your daily goal" tone="peach" progress={Math.min(100, Math.round(completed / Math.max(1, dailyGoal) * 100))}/>
                <StatCard icon={Target} label="Next exam" value={daysUntilExam === null ? "Not set" : daysUntilExam < 0 ? "Past date" : `${daysUntilExam} days`} detail={examDate ? new Date(examDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Add a date in Study Planner"} tone="blue"/>
              </section>

              <section className="content-grid">
                <div className="panel tasks-panel">
                  <div className="panel-heading"><div><h2>Today's study plan</h2><p>Your next small wins are right here.</p></div><button className="text-button" onClick={() => setActive("My Tasks")}>View all <ChevronRight size={16}/></button></div>
                  <div className="task-list">
                    {tasks.slice(0, 5).map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask}/>)}
                    {!tasks.length && <EmptyState text="No study tasks yet. Add your first task to get started."/>}
                  </div>
                  <button className="add-task-inline" onClick={() => { setActive("My Tasks"); setShowTaskForm(true); }}><Plus size={17}/> Add another task</button>
                </div>
                <div className="panel progress-panel">
                  <div className="panel-heading"><div><h2>Your subjects</h2><p>Keep your learning organised.</p></div><button className="round-add" onClick={() => setShowSubjectForm(true)} aria-label="Add subject"><Plus size={18}/></button></div>
                  <div className="subject-list">
                    {subjects.map((subject) => <div className="subject-row" key={subject.id}><div className={`subject-icon ${subject.color}`}><BookOpen size={18}/></div><div className="subject-info"><strong>{subject.name}</strong><span>{subject.topics} topics to explore</span></div><ChevronRight size={17} className="muted-icon"/></div>)}
                    {!subjects.length && <EmptyState text="Add a subject to start organising your learning."/>}
                  </div>
                  <div className="goal-box"><div className="goal-top"><span>Daily task goal</span><strong>{dailyGoal} tasks</strong></div><input aria-label="Daily task goal" type="range" min="1" max="8" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))}/><div className="goal-labels"><span>Easy does it</span><span>Challenge yourself</span></div></div>
                </div>
              </section>
              <section className="tip-banner"><div className="tip-symbol"><Sparkles size={21}/></div><div><strong>A study tip for you</strong><p>Try recalling what you learned without looking at your notes. Active recall helps you find gaps before exam day.</p></div><button className="tip-action" onClick={() => setActive("Quiz Practice")}>Try a quiz <ChevronRight size={16}/></button></section>
            </>
          )}

          {active === "Study Planner" && (
            <section className="subpage">
              <PageTitle eyebrow="PLAN WITH PURPOSE" title="Build your study plan" description="Create a simple draft schedule around your time and subjects. You can edit it anytime." icon={CalendarDays}/>
              <div className="planner-layout">
                <form className="panel form-panel" onSubmit={generatePlan}>
                  <h2>Your study details</h2>
                  <label>Subjects <span>Separate each subject with a comma</span><textarea value={plannerSubjects} onChange={(e) => setPlannerSubjects(e.target.value)} rows="3" placeholder="e.g. Maths, Physics, English" required/></label>
                  <label>Available study time <strong>{plannerHours} hours/day</strong><input type="range" min="1" max="10" value={plannerHours} onChange={(e) => setPlannerHours(Number(e.target.value))}/><div className="range-labels"><span>1 hour</span><span>10 hours</span></div></label>
                  <label>Next exam date <span>Optional</span><input type="date" value={plannerExam} onChange={(e) => setPlannerExam(e.target.value)}/></label>
                  <button className="primary-button full-button" type="submit"><Sparkles size={17}/> Generate my draft plan</button>
                  <p className="form-note">No AI API needed. This creates a local, editable study outline based on your inputs.</p>
                </form>
                <div className="panel plan-output">
                  <div className="panel-heading"><div><h2>{generatedPlan.length ? "Your draft schedule" : "Your plan will appear here"}</h2><p>{generatedPlan.length ? `${generatedPlan.length} focused blocks` : "Add your details to build a starting point."}</p></div><div className="mini-icon"><CalendarDays size={19}/></div></div>
                  {generatedPlan.length ? <div className="generated-list">{generatedPlan.map((item, i) => <div className="generated-item" key={`${item.subject}-${i}`}><div className="time-block">{String(9 + Math.floor(i * 0.75)).padStart(2, "0")}:{i % 2 ? "45" : "00"}</div><div className="generated-copy"><strong>{item.subject}</strong><span>{item.type}</span></div><span className="duration-pill">{item.duration} min</span></div>)}</div> : <div className="empty-plan"><div className="empty-illustration"><CalendarDays size={30}/></div><strong>Your study day, made simpler</strong><p>We'll split your available time into focused blocks with space for learning, revision, and practice.</p></div>}
                  {plannerExam && <div className="exam-note"><Target size={17}/> Exam date selected: {new Date(plannerExam + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. Remember to prioritise the topics you find hardest.</div>}
                </div>
              </div>
              <div className="panel planner-note"><Sparkles size={20}/><div><strong>Make the plan realistic</strong><p>Include breaks, start with your hardest subject when you have the most energy, and adjust the plan based on your progress.</p></div></div>
            </section>
          )}

          {active === "My Tasks" && (
            <section className="subpage">
              <PageTitle eyebrow="ONE STEP AT A TIME" title="My study tasks" description="Turn a big syllabus into small actions you can actually finish." icon={ListTodo}/>
              <div className="task-page-toolbar"><div className="filter-chip"><CheckCircle2 size={16}/>{completed} completed · {tasks.length - completed} remaining</div><button className="primary-button" onClick={() => setShowTaskForm(true)}><Plus size={18}/> New task</button></div>
              {showTaskForm && <form className="panel add-form" onSubmit={addTask}><div className="form-heading"><h2>Add a study task</h2><button type="button" className="icon-button" onClick={() => setShowTaskForm(false)} aria-label="Close form"><X size={18}/></button></div><label>Task name<input autoFocus value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Revise recursion" required/></label><div className="form-row"><label>Subject<select value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)}>{subjects.map((s) => <option key={s.id}>{s.name}</option>)}{!subjects.length && <option>General</option>}</select></label><label>Minutes<input type="number" min="5" max="600" value={taskMinutes} onChange={(e) => setTaskMinutes(e.target.value)} required/></label></div><button className="primary-button" type="submit"><Plus size={17}/> Save task</button></form>}
              <div className="panel all-tasks-panel"><div className="panel-heading"><div><h2>All tasks</h2><p>Check them off as you make progress.</p></div><span className="count-pill">{tasks.length} total</span></div><div className="task-list task-list-large">{tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask}/>)}</div>{!tasks.length && <EmptyState text="Your task list is clear. Add one small goal to get moving."/>}</div>
            </section>
          )}

          {active === "Quiz Practice" && (
            <section className="subpage">
              <PageTitle eyebrow="PRACTISE & REMEMBER" title="AI quiz practice" description="Enter any study topic to generate a fresh quiz, or practise the built-in basics quiz." icon={Brain}/>
              <div className="panel form-panel" style={{ marginBottom: 22 }}>
                <form onSubmit={(event) => { event.preventDefault(); generateAIQuiz(); }}>
                  <label>Quiz topic<input value={quizTopic} onChange={(event) => setQuizTopic(event.target.value)} placeholder="e.g. JavaScript arrays, DBMS, Python loops" /></label>
                  <button className="primary-button full-button" type="submit" disabled={quizLoading}>
                    <Sparkles size={17}/>{quizLoading ? "Generating quiz..." : "Generate AI quiz"}
                  </button>
                </form>
                {quizError && <p role="alert" style={{ color: "#b42318", marginTop: 12 }}>{quizError}</p>}
                <p className="form-note">AI quiz generation needs your StudySaathi backend running on port 3001.</p>
              </div>
              <div className="quiz-wrap">
                <div className="quiz-meta"><span><BookOpen size={16}/> {aiQuestions.length ? `AI quiz: ${quizTopic}` : "Web & CS basics"}</span><span>Question {Math.min(quizIndex + 1, currentQuizQuestions.length)} of {currentQuizQuestions.length}</span></div>
                <div className="quiz-progress"><div style={{ width: `${((quizIndex + 1) / currentQuizQuestions.length) * 100}%` }}/></div>
                {!quizSubmitted ? <>
                  <div className="quiz-question"><div className="question-number">QUESTION {quizIndex + 1}</div><h2>{currentQuizQuestions[quizIndex].q}</h2><div className="option-list">{currentQuizQuestions[quizIndex].options.map((option, i) => <button key={option} className={`option-button ${quizAnswers[quizIndex] === i ? "selected" : ""}`} onClick={() => setQuizAnswers((prev) => ({ ...prev, [quizIndex]: i }))}><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span>{quizAnswers[quizIndex] === i && <Check size={17} className="option-check"/>}</button>)}</div></div>
                  <div className="quiz-footer"><span>{Object.keys(quizAnswers).length} answer(s) selected</span><button className="primary-button" disabled={quizAnswers[quizIndex] === undefined} onClick={() => quizIndex < currentQuizQuestions.length - 1 ? setQuizIndex(quizIndex + 1) : finishQuiz()}>{quizIndex < currentQuizQuestions.length - 1 ? "Next question" : "See my score"} <ChevronRight size={17}/></button></div>
                </> : <div className="quiz-results"><div className="result-trophy"><Trophy size={34}/></div><div className="eyebrow">QUIZ COMPLETE</div><h2>You scored {currentQuizQuestions.filter((q, i) => quizAnswers[i] === q.answer).length} out of {currentQuizQuestions.length}</h2><p>Every question is a chance to learn. Review the explanations and give it another try.</p><div className="review-list">{currentQuizQuestions.map((q, i) => <div className="review-item" key={q.q}><div className={`review-mark ${quizAnswers[i] === q.answer ? "correct" : "incorrect"}`}>{quizAnswers[i] === q.answer ? <Check size={16}/> : <X size={16}/>}</div><div><strong>{q.q}</strong><p>Correct answer: {q.options[q.answer]}. {q.explanation}</p></div></div>)}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}><button className="primary-button" onClick={retryWrongAnswers}><RotateCcw size={17}/> Practise wrong answers</button><button className="secondary-button" onClick={resetQuiz}>Restart full quiz</button></div></div>}
              </div>
              <div className="panel" style={{ marginTop: 22, padding: 22 }}>
                <div className="panel-heading"><div><h2>Your quiz history</h2><p>Your latest results are saved on this device.</p></div><span className="count-pill">{quizHistory.length} saved</span></div>
                {quizHistory.length ? <div className="generated-list">{quizHistory.map((item) => <div className="generated-item" key={item.id}><div className="mini-icon"><Trophy size={18}/></div><div className="generated-copy"><strong>{item.topic}</strong><span>{item.date}</span></div><span className="duration-pill">{item.score}/{item.total} · {Math.round(item.score / Math.max(1, item.total) * 100)}%</span></div>)}</div> : <EmptyState text="Complete your first quiz and your result will appear here."/>}
                {!!quizHistory.length && <button className="text-button" style={{ marginTop: 14 }} onClick={() => { setQuizHistory([]); setToast("Quiz history cleared."); }}>Clear history</button>}
              </div>
            </section>
          )}
          {active === "Flashcards" && (
  <section className="subpage">
    <PageTitle
      eyebrow="LEARN & REMEMBER"
      title="AI Flashcards"
      description="Generate flashcards for any topic and test your memory."
      icon={BookOpen}
    />

    <div className="panel" style={{ marginBottom: 22 }}>
      <form
        className="panel add-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!flashcardTopic.trim()) return;

          setFlashcardLoading(true);
          setFlashcardError("");
          setFlashcards([]);
          setFlashcardIndex(0);
          setFlashcardRevealed(false);

          try {
            const response = await fetch(
              "http://localhost:3001/api/generate-flashcards",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: flashcardTopic }),
              }
            );

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "Could not generate flashcards.");
            }

            setFlashcards(data.flashcards || []);
            if (!data.flashcards?.length) {
              throw new Error("No flashcards were returned. Try another topic.");
            }
          } catch (error) {
            setFlashcardError(error.message || "Could not connect to the backend.");
          } finally {
            setFlashcardLoading(false);
          }
        }}
      >
        <div className="form-heading">
          <h2>Create flashcards</h2>
          <p>Enter any subject or topic to begin.</p>
        </div>

        <label>Study topic</label>
        <input
          value={flashcardTopic}
          onChange={(event) => setFlashcardTopic(event.target.value)}
          placeholder="e.g. JavaScript Arrays"
        />

        <button
          className="primary-button full-button"
          type="submit"
          disabled={flashcardLoading || !flashcardTopic.trim()}
        >
          {flashcardLoading ? "Creating flashcards..." : "Generate AI Flashcards"}
        </button>

        {flashcardError && (
          <p role="alert" style={{ color: "#b42318", marginTop: 12 }}>
            {flashcardError}
          </p>
        )}
      </form>
    </div>

    {flashcards.length > 0 && (
      <div className="panel" style={{ padding: 22 }}>
        <div className="panel-heading">
          <div>
            <h2>Flashcard {flashcardIndex + 1} of {flashcards.length}</h2>
            <p>Try to answer before revealing the answer.</p>
          </div>
        </div>

        <button
          type="button"
          className="panel"
          style={{
            width: "100%",
            minHeight: 220,
            cursor: "pointer",
            textAlign: "center",
            padding: 28,
          }}
          onClick={() => setFlashcardRevealed(!flashcardRevealed)}
        >
          <span className="eyebrow">
            {flashcardRevealed ? "ANSWER" : "QUESTION"}
          </span>
          <h2 style={{ marginTop: 18 }}>
            {flashcardRevealed
              ? flashcards[flashcardIndex].answer
              : flashcards[flashcardIndex].question}
          </h2>
          <p style={{ marginTop: 18 }}>
            {flashcardRevealed ? "Click to see question" : "Click to reveal answer"}
          </p>
        </button>

        <div className="button-row" style={{ marginTop: 16 }}>
          <button
            className="secondary-button"
            type="button"
            disabled={flashcardIndex === 0}
            onClick={() => {
              setFlashcardIndex(flashcardIndex - 1);
              setFlashcardRevealed(false);
            }}
          >
            Previous
          </button>

          <button
            className="primary-button"
            type="button"
            disabled={flashcardIndex === flashcards.length - 1}
            onClick={() => {
              setFlashcardIndex(flashcardIndex + 1);
              setFlashcardRevealed(false);
            }}
          >
            Next
          </button>
        </div>
      </div>
    )}
  </section>
)}

          {active === "Focus Room" && (
            <section className="subpage focus-page">
              <PageTitle eyebrow="ONE THING AT A TIME" title="Welcome to your Focus Room" description="Put distractions aside and give one task your full attention." icon={Timer}/>
              <div className="focus-card panel"><div className="focus-badge"><Coffee size={16}/> FOCUS SESSION</div><div className="timer-ring"><div className="timer-inner"><span className="timer-time">{timeLabel}</span><span className="timer-caption">{timerRunning ? "YOU'RE IN THE ZONE" : secondsLeft === 0 ? "SESSION COMPLETE" : "READY WHEN YOU ARE"}</span></div></div><div className="timer-presets">{[15, 25, 45].map((mins) => <button key={mins} className={`preset-button ${timerMinutes === mins ? "chosen" : ""}`} onClick={() => changeTimer(mins)}>{mins} min</button>)}</div><div className="timer-actions"><button className="primary-button" onClick={() => { if (secondsLeft === 0) setSecondsLeft(timerMinutes * 60); setTimerRunning(!timerRunning); }}>{timerRunning ? "Pause session" : secondsLeft === 0 ? "Start again" : "Start focusing"}</button><button className="secondary-button" onClick={() => { setTimerRunning(false); setSecondsLeft(timerMinutes * 60); }}>Reset</button></div><p className="focus-reminder">Take a short break between sessions. Your brain needs recovery time too.</p></div>
              <div className="focus-bottom-grid"><div className="panel focus-tip"><div className="mini-icon"><Target size={19}/></div><div><strong>Pick one clear goal</strong><p>Before you start, write down exactly what you want to finish in this session.</p></div></div><div className="panel focus-tip"><div className="mini-icon lilac"><Coffee size={19}/></div><div><strong>Breaks are productive</strong><p>Stand up, stretch, and drink water after a focused block of work.</p></div></div></div>
            </section>
          )}

          <footer className="footer"><span>© {new Date().getFullYear()} StudySaathi</span><span>Built for better learning, one day at a time <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>

      {showSubjectForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowSubjectForm(false); }}><form className="modal-card" onSubmit={addSubject}><div className="form-heading"><div><div className="eyebrow">ORGANISE YOUR LEARNING</div><h2>Add a subject</h2></div><button type="button" className="icon-button" onClick={() => setShowSubjectForm(false)} aria-label="Close"><X size={19}/></button></div><label>Subject name<input autoFocus value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Operating Systems" required/></label><label>Topics in syllabus<input type="number" min="1" max="500" value={subjectTopics} onChange={(e) => setSubjectTopics(e.target.value)} required/></label><button className="primary-button full-button" type="submit"><Plus size={17}/> Add subject</button></form></div>}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone, progress }) {
  return <div className="stat-card"><div className="stat-top"><div className={`stat-icon ${tone}`}><Icon size={19}/></div>{progress !== undefined && <span className="stat-percent">{progress}%</span>}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div>{progress !== undefined && <div className="tiny-progress"><div style={{ width: `${progress}%` }}/></div>}</div>;
}

function TaskRow({ task, onToggle, onDelete }) {
  return <div className={`task-row ${task.done ? "task-done" : ""}`}><button className="task-check" onClick={() => onToggle(task.id)} aria-label={task.done ? "Mark incomplete" : "Mark complete"}>{task.done ? <CheckCircle2 size={21}/> : <Circle size={21}/>}</button><div className="task-copy"><strong>{task.title}</strong><div className="task-meta"><span>{task.subject}</span><span className="meta-dot"/> <span><Clock3 size={13}/>{task.minutes} min</span></div></div><button className="delete-task" onClick={() => onDelete(task.id)} aria-label="Delete task"><Trash2 size={16}/></button></div>;
}

function PageTitle({ eyebrow, title, description, icon: Icon }) {
  return <div className="page-title-row"><div><div className="eyebrow"><Icon size={15}/>{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>;
}

function EmptyState({ text }) {
  return <div className="empty-state"><div className="empty-illustration"><BookOpen size={25}/></div><p>{text}</p></div>;
}

export default App;

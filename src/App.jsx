import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown, CircleHelp, Clock3, Download, Ellipsis, LayoutDashboard, ListChecks, MapPin, Plus, Search, Settings2, Ticket, Users, X, } from 'lucide-react';
import './App.css';
const today = new Date();
const dateIn = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};
const id = () => crypto.randomUUID();
const seedEvents = [
    {
        id: 'summit', title: 'Fieldnotes Design Summit', type: 'Conference', date: dateIn(4), start: '09:00', end: '18:30',
        location: 'The Glasshouse', address: '18 Kingsland Road, London', cover: 'photo-1511578314322-379afb476865', accent: 'citrus',
        description: 'A day for the people shaping what comes next in design. Good ideas, good company, no filler.',
        guests: [
            { id: id(), name: 'Sofia Chen', email: 'sofia@fieldnotes.studio', status: 'Confirmed' },
            { id: id(), name: 'Mateo Rivera', email: 'mateo@northstar.design', status: 'Confirmed' },
            { id: id(), name: 'Aisha Patel', email: 'aisha@formandfunction.co', status: 'Pending' },
            { id: id(), name: 'Oliver James', email: 'oliver@typefoundry.uk', status: 'Confirmed' },
            { id: id(), name: 'Nina Andersson', email: 'nina@andco.design', status: 'Pending' },
        ],
        agenda: [
            { id: id(), time: '09:00', title: 'Doors & first coffee', note: 'Atrium · espresso by Little Wave' },
            { id: id(), time: '10:00', title: 'Opening: Room for better', note: 'Main stage · Priya Nair' },
            { id: id(), time: '11:15', title: 'Making the invisible visible', note: 'Studio A · Design systems in the wild' },
            { id: id(), time: '13:00', title: 'Long table lunch', note: 'Atrium · family-style, all diets covered' },
            { id: id(), time: '15:30', title: 'Small ideas, big afterlives', note: 'Main stage · Panel discussion' },
        ],
        tasks: [
            { id: id(), title: 'Send final attendee briefing', owner: 'Sofia Chen', due: dateIn(1), done: true },
            { id: id(), title: 'Confirm AV run-through', owner: 'Mateo Rivera', due: dateIn(2), done: false },
            { id: id(), title: 'Print welcome cards', owner: 'Aisha Patel', due: dateIn(2), done: false },
            { id: id(), title: 'Share dietary notes with venue', owner: 'You', due: dateIn(3), done: false },
        ],
    },
    {
        id: 'supper-club', title: 'Sunday Table: Autumn Edition', type: 'Dinner', date: dateIn(11), start: '18:00', end: '22:00',
        location: 'Lark & Linen', address: '42 Lamb’s Conduit Street, London', cover: 'photo-1414235077428-338989a2e8c0', accent: 'plum',
        description: 'A long-table supper for the curious. Seasonal plates, tiny speeches, plenty of second helpings.',
        guests: [
            { id: id(), name: 'Elliot Shaw', email: 'elliot@example.com', status: 'Confirmed' },
            { id: id(), name: 'Camille Laurent', email: 'camille@example.com', status: 'Confirmed' },
            { id: id(), name: 'Theo Martin', email: 'theo@example.com', status: 'Pending' },
        ],
        agenda: [
            { id: id(), time: '18:00', title: 'A little welcome drink', note: 'At the bar' },
            { id: id(), time: '19:00', title: 'Everyone to the table', note: 'Three courses, shared plates' },
            { id: id(), time: '21:00', title: 'One good thing', note: 'A toast to the month ahead' },
        ],
        tasks: [
            { id: id(), title: 'Lock in the seasonal menu', owner: 'Camille Laurent', due: dateIn(5), done: false },
            { id: id(), title: 'Check the playlist', owner: 'You', due: dateIn(8), done: false },
        ],
    },
    {
        id: 'open-studio', title: 'Open Studio No. 08', type: 'Community', date: dateIn(19), start: '14:00', end: '19:00',
        location: 'Morrow Workshop', address: 'Unit 4, Mare Street, London', cover: 'photo-1517457373958-b7bdd4587205', accent: 'blue',
        description: 'An open door, a shared table, a few unfinished things. Come see what the neighbourhood is making.',
        guests: [
            { id: id(), name: 'Rory Ellis', email: 'rory@example.com', status: 'Confirmed' },
            { id: id(), name: 'Amara Okafor', email: 'amara@example.com', status: 'Pending' },
        ],
        agenda: [
            { id: id(), time: '14:00', title: 'Workshop doors open', note: 'Drop in whenever' },
            { id: id(), time: '16:00', title: 'Show & tell', note: 'Five minutes each, no slides' },
        ],
        tasks: [
            { id: id(), title: 'Gather workshop materials', owner: 'Rory Ellis', due: dateIn(12), done: false },
            { id: id(), title: 'Ask the neighbours to share', owner: 'You', due: dateIn(10), done: true },
        ],
    },
];
function readEvents() {
    try {
        const saved = localStorage.getItem('gather.events.v1');
        return saved ? JSON.parse(saved) : seedEvents;
    }
    catch {
        return seedEvents;
    }
}
const formatDate = (value, options = { weekday: 'short', month: 'short', day: 'numeric' }) => new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', options);
const initials = (name) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
const monthLabel = today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const exportCsv = (filename, columns, rows) => {
    const escape = (value) => `"${value.replaceAll('"', '""')}"`;
    const content = [columns, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};
function App() {
    const [events, setEvents] = useState(readEvents);
    const [page, setPage] = useState('Overview');
    const [selectedId, setSelectedId] = useState(null);
    const [detailTab, setDetailTab] = useState('Overview');
    const [modal, setModal] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All events');
    const [toast, setToast] = useState('');
    const selectedEvent = events.find((event) => event.id === selectedId) ?? null;
    const upcoming = useMemo(() => events.filter((event) => event.date >= today.toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)), [events]);
    const allGuests = events.flatMap((event) => event.guests.map((guest) => ({ ...guest, eventName: event.title, eventId: event.id })));
    const allTasks = events.flatMap((event) => event.tasks.map((task) => ({ ...task, eventName: event.title, eventId: event.id })));
    const pendingTasks = allTasks.filter((task) => !task.done);
    const persist = (next, message) => {
        setEvents(next);
        localStorage.setItem('gather.events.v1', JSON.stringify(next));
        if (message) {
            setToast(message);
            window.setTimeout(() => setToast(''), 2600);
        }
    };
    const openEvent = (event) => {
        setSelectedId(event.id);
        setDetailTab('Overview');
        setPage('Events');
    };
    const saveEvent = (form, editId) => {
        if (editId) {
            persist(events.map((event) => event.id === editId ? { ...event, ...form } : event), 'Event details updated');
        }
        else {
            const newEvent = { ...form, id: id(), guests: [], agenda: [], tasks: [], cover: 'photo-1511795409834-ef04bbd61622', accent: 'blue' };
            persist([...events, newEvent], 'Your event is ready to go');
            setSelectedId(newEvent.id);
            setDetailTab('Overview');
            setPage('Events');
        }
        setModal(null);
        setEditingEvent(null);
    };
    const updateEventList = (eventId, transform, message) => {
        persist(events.map((event) => event.id === eventId ? transform(event) : event), message);
    };
    const changePage = (next) => {
        setPage(next);
        setSelectedId(null);
        setSearch('');
    };
    const navItems = [
        { label: 'Overview', icon: <LayoutDashboard size={17}/> },
        { label: 'Events', icon: <CalendarDays size={17}/> },
        { label: 'Calendar', icon: <Clock3 size={17}/> },
        { label: 'Guests', icon: <Users size={17}/> },
        { label: 'Tasks', icon: <ListChecks size={17}/> },
    ];
    const headerTitle = selectedEvent ? selectedEvent.title : page;
    const headerSubtitle = selectedEvent ? `${selectedEvent.type}  /  ${formatDate(selectedEvent.date, { month: 'long', day: 'numeric', year: 'numeric' })}` : page === 'Overview' ? 'A little order for the good things you’re making.' : page === 'Calendar' ? 'Everything coming up, at a glance.' : page === 'Guests' ? 'The people who make it worth gathering.' : page === 'Tasks' ? 'Small things, all moving in the right direction.' : 'Make room for something worth remembering.';
    return (<div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => changePage('Overview')} aria-label="Gather home">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span className="brand-name">gather<span>.</span></span>
        </button>
        <div className="workspace-switch"><span className="workspace-avatar">F</span><span className="workspace-copy"><b>Fieldnotes Studio</b><small>Personal workspace</small></span><ChevronDown size={15}/></div>
        <div className="side-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => <button key={item.label} className={`nav-item ${page === item.label && !selectedEvent ? 'active' : ''}`} onClick={() => changePage(item.label)}>{item.icon}<span>{item.label}</span>{item.label === 'Tasks' && pendingTasks.length > 0 && <span className="nav-count">{pendingTasks.length}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-label">YOUR SPACE</div>
          <button className="nav-item" onClick={() => { setEditingEvent(null); setModal('event'); }}><Plus size={17}/><span>Create an event</span></button>
          <div className="sidebar-note"><div className="note-icon"><CircleHelp size={16}/></div><div><b>A hand when you need it</b><span>Find answers in the help centre.</span></div><ArrowUpRight size={14}/></div>
          <button className="profile-row"><span className="avatar avatar-green">JD</span><span className="profile-copy"><b>Jordan Davis</b><small>Workspace admin</small></span><Ellipsis size={18}/></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Fieldnotes Studio</span><span className="crumb-slash">/</span><b>{selectedEvent ? 'Events' : page}</b></div>
          <div className="top-actions"><span className="date-chip"><CalendarDays size={15}/>{monthLabel}</span><button className="icon-button notification-button" aria-label="Notifications" onClick={() => { setToast('You’re all caught up'); window.setTimeout(() => setToast(''), 2600); }}><Bell size={17}/><i /></button><span className="avatar avatar-green top-avatar">JD</span></div>
        </header>

        <div className="page-content">
          <div className="page-heading"><div><div className="eyebrow">{selectedEvent ? 'EVENT WORKSPACE' : page === 'Overview' ? 'MONDAY, {DATE}'.replace('{DATE}', today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase()) : 'FIELDNOTES STUDIO'}</div><h1>{headerTitle}</h1><p>{headerSubtitle}</p></div><div className="heading-actions">{selectedEvent ? <><button className="button button-secondary" onClick={() => { setEditingEvent(selectedEvent); setModal('event'); }}><Settings2 size={16}/>Edit event</button><button className="button button-primary" onClick={() => setModal('guest')}><Plus size={16}/>Add a guest</button></> : <button className="button button-primary" onClick={() => { setEditingEvent(null); setModal('event'); }}><Plus size={17}/>Create event</button>}</div></div>

          {selectedEvent ? <EventWorkspace event={selectedEvent} tab={detailTab} onTab={setDetailTab} onModal={setModal} onBack={() => setSelectedId(null)} onEdit={() => { setEditingEvent(selectedEvent); setModal('event'); }} onUpdate={updateEventList}/> : <>
            {page === 'Overview' && <Overview events={upcoming} tasks={pendingTasks} onOpen={openEvent} onCreate={() => { setEditingEvent(null); setModal('event'); }} onPage={changePage}/>}
            {page === 'Events' && <EventsPage events={events} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} onOpen={openEvent}/>}
            {page === 'Calendar' && <CalendarPage events={upcoming} onOpen={openEvent}/>}
            {page === 'Guests' && <GuestsPage guests={allGuests} onOpen={(eventId) => { const event = events.find((item) => item.id === eventId); if (event)
            openEvent(event); }} onExport={() => exportCsv('gather-guests.csv', ['Name', 'Email', 'Response', 'Event'], allGuests.map((guest) => [guest.name, guest.email, guest.status, guest.eventName]))}/>}
            {page === 'Tasks' && <TasksPage tasks={allTasks} events={events} onOpen={(eventId) => openEvent(events.find((event) => event.id === eventId))} onToggle={(eventId, taskId) => updateEventList(eventId, (event) => ({ ...event, tasks: event.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) }), 'Task status updated')}/>}
          </>}
        </div>
      </main>

      {modal && <Modal onClose={() => { setModal(null); setEditingEvent(null); }}><>
        {modal === 'event' && <EventForm event={editingEvent} onSave={saveEvent} onCancel={() => { setModal(null); setEditingEvent(null); }}/>}
        {modal === 'guest' && selectedEvent && <GuestForm onCancel={() => setModal(null)} onSave={(guest) => { updateEventList(selectedEvent.id, (event) => ({ ...event, guests: [...event.guests, { ...guest, id: id() }] }), 'Guest added to the list'); setModal(null); }}/>}
        {modal === 'agenda' && selectedEvent && <AgendaForm onCancel={() => setModal(null)} onSave={(item) => { updateEventList(selectedEvent.id, (event) => ({ ...event, agenda: [...event.agenda, { ...item, id: id() }].sort((a, b) => a.time.localeCompare(b.time)) }), 'Agenda updated'); setModal(null); }}/>}
        {modal === 'task' && selectedEvent && <TaskForm onCancel={() => setModal(null)} onSave={(task) => { updateEventList(selectedEvent.id, (event) => ({ ...event, tasks: [...event.tasks, { ...task, id: id(), done: false }] }), 'Task added to the list'); setModal(null); }}/>}
      </></Modal>}
      {toast && <div className="toast"><span><Check size={15}/></span>{toast}</div>}
    </div>);
}
function Overview({ events, tasks, onOpen, onCreate, onPage }) {
    const nextEvent = events[0];
    const totalGuests = events.reduce((sum, event) => sum + event.guests.length, 0);
    const confirmed = events.reduce((sum, event) => sum + event.guests.filter((guest) => guest.status === 'Confirmed').length, 0);
    return <div className="overview-layout">
    <section className="stats-row">
      <StatCard label="UPCOMING EVENTS" value={String(events.length).padStart(2, '0')} detail="You're making good plans" icon={<CalendarDays size={17}/>} tone="stat-blue"/>
      <StatCard label="ON THE GUEST LIST" value={String(totalGuests).padStart(2, '0')} detail={`${confirmed} have said yes`} icon={<Users size={17}/>} tone="stat-green"/>
      <StatCard label="TO-DOS IN MOTION" value={String(tasks.length).padStart(2, '0')} detail={`${tasks.filter((task) => task.done).length} already taken care of`} icon={<CheckCheck size={17}/>} tone="stat-orange"/>
    </section>

    {nextEvent ? <section className="feature-event" style={{ backgroundImage: `linear-gradient(90deg, rgba(20, 35, 29, .93) 0%, rgba(20, 35, 29, .73) 47%, rgba(20, 35, 29, .1) 100%), url(https://images.unsplash.com/${nextEvent.cover}?auto=format&fit=crop&w=1400&q=85)` }}>
      <div className="feature-copy"><span className="feature-kicker"><span className="live-dot"/>UP NEXT <span className="feature-dot">·</span> {formatDate(nextEvent.date, { weekday: 'long', month: 'long', day: 'numeric' })}</span><h2>{nextEvent.title}</h2><p>{nextEvent.description}</p><div className="feature-meta"><span><Clock3 size={14}/>{nextEvent.start} — {nextEvent.end}</span><span><MapPin size={14}/>{nextEvent.location}</span></div><button className="feature-link" onClick={() => onOpen(nextEvent)}>Open event <ArrowRight size={15}/></button></div>
      <div className="feature-count"><span>{nextEvent.guests.length}</span><small>on the list</small><span className="count-rule"/><span>{nextEvent.tasks.filter((task) => !task.done).length}</span><small>things to do</small></div>
    </section> : <section className="empty-feature"><p>Your next good idea starts here.</p><button className="button button-primary" onClick={onCreate}><Plus size={16}/>Create an event</button></section>}

    <div className="overview-columns"><section className="panel events-panel"><div className="panel-heading"><div><span className="section-label">ON THE HORIZON</span><h2>Coming up</h2></div><button className="text-action" onClick={() => onPage('Events')}>All events <ArrowRight size={14}/></button></div>
      {events.length ? <div className="compact-event-list">{events.slice(0, 4).map((event) => <EventRow key={event.id} event={event} onClick={() => onOpen(event)}/>)}</div> : <EmptyState text="Nothing planned just yet." action="Make the first one" onClick={onCreate}/>}
    </section>
    <section className="panel tasks-panel"><div className="panel-heading"><div><span className="section-label">A FEW LOOSE ENDS</span><h2>On your list</h2></div><button className="text-action" onClick={() => onPage('Tasks')}>All tasks <ArrowRight size={14}/></button></div>
      {tasks.length ? <div className="task-list">{tasks.slice(0, 4).map((task) => <div className="task-row" key={task.id}><span className="task-check"><Check size={12}/></span><span className="task-row-copy"><b>{task.title}</b><small>{task.eventName} <span>·</span> due {formatDate(task.due, { month: 'short', day: 'numeric' })}</small></span><span className="task-owner">{initials(task.owner)}</span></div>)}</div> : <EmptyState text="You're all caught up."/>}
    </section></div>
  </div>;
}
function StatCard({ label, value, detail, icon, tone }) {
    return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><div className="stat-mark"><span /><span /><span /><span /></div></div>;
}
function EventRow({ event, onClick }) {
    return <button className="event-row" onClick={onClick}><span className={`event-date ${event.accent}`}><b>{new Date(`${event.date}T12:00:00`).getDate()}</b><small>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</small></span><span className="event-row-info"><b>{event.title}</b><small><Clock3 size={12}/>{event.start}<span className="meta-separator">·</span><MapPin size={12}/>{event.location}</small></span><span className="event-guests"><Users size={13}/>{event.guests.length}</span><ArrowRight className="row-arrow" size={15}/></button>;
}
function EmptyState({ text, action, onClick }) {
    return <div className="empty-state"><span className="empty-mark"><CalendarDays size={19}/></span><p>{text}</p>{action && onClick && <button className="text-action" onClick={onClick}>{action} <ArrowRight size={13}/></button>}</div>;
}
function EventsPage({ events, search, setSearch, filter, setFilter, onOpen }) {
    const filtered = events.filter((event) => (filter === 'All events' || event.type === filter) && `${event.title} ${event.location} ${event.type}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.date.localeCompare(b.date));
    return <section className="panel full-panel"><div className="list-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an event..." aria-label="Search events"/></div><select className="select-control" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by event type"><option>All events</option>{['Conference', 'Dinner', 'Community', 'Workshop', 'Celebration'].map((type) => <option key={type}>{type}</option>)}</select><button className="button button-secondary" onClick={() => exportCsv('gather-events.csv', ['Event', 'Type', 'Date', 'Starts', 'Ends', 'Venue', 'Address', 'Guests'], filtered.map((event) => [event.title, event.type, event.date, event.start, event.end, event.location, event.address, String(event.guests.length)]))}><Download size={15}/>Export</button></div><div className="table-heading event-table-heading"><span>EVENT</span><span>DATE & TIME</span><span>GUESTS</span><span>STATUS</span><span /></div>{filtered.length ? filtered.map((event) => <button key={event.id} className="table-row event-table-row" onClick={() => onOpen(event)}><span className="table-event-name"><span className={`event-mini-icon ${event.accent}`}><Ticket size={16}/></span><span><b>{event.title}</b><small>{event.type} · {event.location}</small></span></span><span className="table-date"><b>{formatDate(event.date)}</b><small>{event.start} — {event.end}</small></span><span className="table-guests"><Users size={14}/>{event.guests.length}</span><span><i className={`status-pill ${event.date >= today.toISOString().slice(0, 10) ? 'status-upcoming' : 'status-past'}`}/>{event.date >= today.toISOString().slice(0, 10) ? 'Upcoming' : 'Past'}</span><ArrowRight size={15} className="row-arrow"/></button>) : <EmptyState text="No events match that search."/>}</section>;
}
function CalendarPage({ events, onOpen }) {
    const monthEvents = events.filter((event) => event.date.slice(0, 7) === today.toISOString().slice(0, 7));
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const cells = [...Array(firstDay === 0 ? 6 : firstDay - 1).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
    return <div className="calendar-layout"><section className="panel calendar-panel"><div className="panel-heading"><div><span className="section-label">YOUR MONTH, IN VIEW</span><h2>{monthLabel}</h2></div><div className="calendar-legend"><i />Event day</div></div><div className="calendar-grid"><div className="calendar-weekdays">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-days">{cells.map((day, index) => { const event = day ? monthEvents.find((item) => Number(item.date.slice(-2)) === day) : undefined; return <button key={`${day ?? 'blank'}-${index}`} disabled={!day} onClick={() => event && onOpen(event)} className={`calendar-day ${day === today.getDate() ? 'is-today' : ''} ${event ? 'has-event' : ''}`}><span>{day}</span>{event && <small>{event.title}</small>}</button>; })}</div></div></section><section className="panel month-agenda"><div className="panel-heading"><div><span className="section-label">THIS MONTH</span><h2>Event dates</h2></div></div>{monthEvents.length ? monthEvents.map((event) => <EventRow key={event.id} event={event} onClick={() => onOpen(event)}/>) : <EmptyState text="A clear calendar. What will you make?"/>}</section></div>;
}
function GuestsPage({ guests, onOpen, onExport }) {
    return <section className="panel full-panel"><div className="list-toolbar"><div><span className="section-label">EVERY EVENT, ONE LIST</span><h2 className="list-title">{guests.length} people invited</h2></div><button className="button button-secondary" onClick={onExport}><Download size={15}/>Export list</button></div><div className="table-heading guest-table-heading"><span>GUEST</span><span>EVENT</span><span>RESPONSE</span><span /></div>{guests.length ? guests.map((guest) => <button className="table-row guest-table-row" key={guest.id} onClick={() => onOpen(guest.eventId)}><span className="table-event-name"><span className="avatar guest-avatar">{initials(guest.name)}</span><span><b>{guest.name}</b><small>{guest.email}</small></span></span><span className="guest-event-title">{guest.eventName}</span><span><span className={`guest-status ${guest.status.toLowerCase()}`}><i />{guest.status}</span></span><ArrowRight size={15} className="row-arrow"/></button>) : <EmptyState text="The best events start with an invite."/>}</section>;
}
function TasksPage({ tasks, events, onOpen, onToggle }) {
    return <div className="tasks-page-layout"><section className="panel all-tasks-panel"><div className="panel-heading"><div><span className="section-label">KEEP THINGS MOVING</span><h2>All tasks <span className="heading-count">{tasks.filter((task) => !task.done).length} open</span></h2></div></div>{tasks.length ? tasks.map((task) => <button className={`all-task-row ${task.done ? 'is-done' : ''}`} key={task.id} onClick={() => onToggle(task.eventId, task.id)}><span className={`checkbox-mark ${task.done ? 'checked' : ''}`}>{task.done && <Check size={12}/>}</span><span className="all-task-copy"><b>{task.title}</b><small>{task.eventName} <span>·</span> {task.owner}</small></span><span className="task-due">{formatDate(task.due, { month: 'short', day: 'numeric' })}</span></button>) : <EmptyState text="Nothing on the list. Enjoy the breathing room."/>}</section><section className="panel task-events-panel"><div className="panel-heading"><div><span className="section-label">BY EVENT</span><h2>In good hands</h2></div></div>{events.map((event) => <button key={event.id} className="task-event-link" onClick={() => onOpen(event.id)}><span className="event-mini-icon citrus"><CalendarDays size={16}/></span><span><b>{event.title}</b><small>{event.tasks.filter((task) => !task.done).length} tasks left</small></span><ArrowRight size={14}/></button>)}</section></div>;
}
function EventWorkspace({ event, tab, onTab, onModal, onUpdate }) {
    const tabs = ['Overview', 'Agenda', 'Guests', 'Tasks'];
    const confirmedCount = event.guests.filter((guest) => guest.status === 'Confirmed').length;
    const pendingCount = event.guests.filter((guest) => guest.status === 'Pending').length;
    return <div className="event-workspace"><div className="event-detail-strip"><div className="event-detail-photo" style={{ backgroundImage: `url(https://images.unsplash.com/${event.cover}?auto=format&fit=crop&w=700&q=80)` }}/><div className="event-detail-info"><span className="detail-type">{event.type}</span><h2>{event.title}</h2><p>{event.description}</p><div className="event-detail-meta"><span><CalendarDays size={14}/>{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span><span><Clock3 size={14}/>{event.start} — {event.end}</span><span><MapPin size={14}/>{event.location}</span></div></div><button className="detail-edit" aria-label="Edit event details" onClick={() => onModal('event')}><Settings2 size={16}/></button></div>
    <div className="detail-tabs">{tabs.map((item) => <button key={item} className={tab === item ? 'selected' : ''} onClick={() => onTab(item)}>{item}<span>{item === 'Guests' ? event.guests.length : item === 'Agenda' ? event.agenda.length : item === 'Tasks' ? event.tasks.filter((task) => !task.done).length : ''}</span></button>)}</div>
    {tab === 'Overview' && <div className="detail-overview"><div className="detail-stat-row"><div className="detail-stat"><Users size={17}/><span><b>{event.guests.length}</b><small>invited</small></span></div><div className="detail-stat"><CheckCheck size={17}/><span><b>{confirmedCount}</b><small>confirmed</small></span></div><div className="detail-stat"><Clock3 size={17}/><span><b>{event.tasks.filter((task) => !task.done).length}</b><small>open tasks</small></span></div></div><div className="detail-columns"><section className="panel detail-panel"><div className="panel-heading"><div><span className="section-label">THE RUN OF SHOW</span><h2>First few moments</h2></div><button className="text-action" onClick={() => onTab('Agenda')}>Full agenda <ArrowRight size={13}/></button></div>{event.agenda.length ? event.agenda.slice(0, 3).map((item) => <div className="agenda-mini-row" key={item.id}><time>{item.time}</time><span><b>{item.title}</b><small>{item.note}</small></span></div>) : <EmptyState text="Add a little structure to the day." action="Build the agenda" onClick={() => onModal('agenda')}/>}</section><section className="panel detail-panel"><div className="panel-heading"><div><span className="section-label">WHO'S COMING</span><h2>Guest list</h2></div><button className="text-action" onClick={() => onTab('Guests')}>See all <ArrowRight size={13}/></button></div>{event.guests.length ? event.guests.slice(0, 4).map((guest) => <div className="mini-guest-row" key={guest.id}><span className="avatar guest-avatar">{initials(guest.name)}</span><span><b>{guest.name}</b><small>{guest.email}</small></span><i className={`guest-dot ${guest.status.toLowerCase()}`}/></div>) : <EmptyState text="A gathering is people first." action="Invite someone" onClick={() => onModal('guest')}/>}<div className="guest-summary"><span>{confirmedCount} confirmed</span><span>{pendingCount} awaiting reply</span></div></section></div></div>}
    {tab === 'Agenda' && <section className="panel full-panel detail-list-panel"><div className="panel-heading"><div><span className="section-label">A GOOD DAY HAS A RHYTHM</span><h2>Agenda</h2></div><button className="button button-secondary" onClick={() => onModal('agenda')}><Plus size={15}/>Add a moment</button></div>{event.agenda.length ? event.agenda.map((item) => <div className="agenda-row" key={item.id}><time>{item.time}</time><span className="agenda-line"/><span className="agenda-copy"><b>{item.title}</b><small>{item.note}</small></span><button className="icon-button subtle-button" aria-label={`Remove ${item.title}`} onClick={() => onUpdate(event.id, (current) => ({ ...current, agenda: current.agenda.filter((row) => row.id !== item.id) }), 'Agenda item removed')}><X size={15}/></button></div>) : <EmptyState text="No moments on the schedule yet." action="Add the first one" onClick={() => onModal('agenda')}/>}</section>}
    {tab === 'Guests' && <section className="panel full-panel detail-list-panel"><div className="panel-heading"><div><span className="section-label">MAKE ROOM AT THE TABLE</span><h2>Guest list <span className="heading-count">{confirmedCount} confirmed · {pendingCount} waiting</span></h2></div><button className="button button-secondary" onClick={() => onModal('guest')}><Plus size={15}/>Add a guest</button></div>{event.guests.length ? event.guests.map((guest) => <div className="guest-detail-row" key={guest.id}><span className="avatar guest-avatar">{initials(guest.name)}</span><span className="guest-detail-name"><b>{guest.name}</b><small>{guest.email}</small></span><span className={`guest-status ${guest.status.toLowerCase()}`}><i />{guest.status}</span><button className="icon-button subtle-button" aria-label={`Remove ${guest.name}`} onClick={() => onUpdate(event.id, (current) => ({ ...current, guests: current.guests.filter((row) => row.id !== guest.id) }), 'Guest removed from list')}><X size={15}/></button></div>) : <EmptyState text="No invitations out yet." action="Invite someone" onClick={() => onModal('guest')}/>}</section>}
    {tab === 'Tasks' && <section className="panel full-panel detail-list-panel"><div className="panel-heading"><div><span className="section-label">ONE THING AT A TIME</span><h2>Tasks <span className="heading-count">{event.tasks.filter((task) => !task.done).length} open</span></h2></div><button className="button button-secondary" onClick={() => onModal('task')}><Plus size={15}/>Add a task</button></div>{event.tasks.length ? event.tasks.map((task) => <button className={`all-task-row ${task.done ? 'is-done' : ''}`} key={task.id} onClick={() => onUpdate(event.id, (current) => ({ ...current, tasks: current.tasks.map((row) => row.id === task.id ? { ...row, done: !row.done } : row) }), 'Task status updated')}><span className={`checkbox-mark ${task.done ? 'checked' : ''}`}>{task.done && <Check size={12}/>}</span><span className="all-task-copy"><b>{task.title}</b><small>{task.owner}</small></span><span className="task-due">Due {formatDate(task.due, { month: 'short', day: 'numeric' })}</span><ArrowRight size={14} className="row-arrow"/></button>) : <EmptyState text="No loose ends to chase." action="Add a task" onClick={() => onModal('task')}/>}</section>}
  </div>;
}
function Modal({ children, onClose }) {
    return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget)
        onClose(); }}><div className="modal-card" role="dialog" aria-modal="true">{children}</div></div>;
}
function EventForm({ event, onSave, onCancel }) {
    const submit = (formEvent) => {
        formEvent.preventDefault();
        const values = new FormData(formEvent.currentTarget);
        onSave({ title: String(values.get('title')), type: String(values.get('type')), date: String(values.get('date')), start: String(values.get('start')), end: String(values.get('end')), location: String(values.get('location')), address: String(values.get('address')), description: String(values.get('description')) }, event?.id);
    };
    return <form onSubmit={submit}><div className="modal-heading"><div><span className="section-label">A REASON TO GET TOGETHER</span><h2>{event ? 'Edit event' : 'Make something happen'}</h2></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Close"><X size={18}/></button></div><label className="form-field">Event name<input name="title" placeholder="Something people will remember" required defaultValue={event?.title}/></label><div className="form-grid"><label className="form-field">Kind of gathering<select name="type" defaultValue={event?.type ?? 'Community'}>{['Community', 'Conference', 'Dinner', 'Workshop', 'Celebration', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></label><label className="form-field">Date<input name="date" type="date" required defaultValue={event?.date ?? dateIn(7)}/></label></div><div className="form-grid"><label className="form-field">Starts<input name="start" type="time" required defaultValue={event?.start ?? '18:00'}/></label><label className="form-field">Ends<input name="end" type="time" required defaultValue={event?.end ?? '21:00'}/></label></div><label className="form-field">Venue<input name="location" placeholder="The good place on the corner" required defaultValue={event?.location}/></label><label className="form-field">Address<input name="address" placeholder="Street, city" defaultValue={event?.address}/></label><label className="form-field">A few words about it<textarea name="description" placeholder="What's the feeling you're hoping for?" rows={3} defaultValue={event?.description}/></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{event ? 'Save changes' : 'Create event'} <ArrowRight size={15}/></button></div></form>;
}
function GuestForm({ onSave, onCancel }) {
    return <SimpleForm eyebrow="A LITTLE MORE COMPANY" title="Invite someone in" onCancel={onCancel} submitLabel="Add to guest list" onSubmit={(values) => onSave({ name: values.get('name'), email: values.get('email'), status: 'Pending' })}><label className="form-field">Name<input name="name" placeholder="Their full name" required/></label><label className="form-field">Email address<input name="email" type="email" placeholder="hello@somewhere.com" required/></label></SimpleForm>;
}
function AgendaForm({ onSave, onCancel }) {
    return <SimpleForm eyebrow="FIND THE FLOW" title="Add a moment" onCancel={onCancel} submitLabel="Add to agenda" onSubmit={(values) => onSave({ time: values.get('time'), title: values.get('title'), note: values.get('note') })}><label className="form-field">What happens?<input name="title" placeholder="A good opening, perhaps" required/></label><label className="form-field">Time<input name="time" type="time" required defaultValue="10:00"/></label><label className="form-field">A little detail<input name="note" placeholder="Where, who, or what to bring"/></label></SimpleForm>;
}
function TaskForm({ onSave, onCancel }) {
    return <SimpleForm eyebrow="ONE LESS THING TO HOLD IN YOUR HEAD" title="Add a task" onCancel={onCancel} submitLabel="Add to the list" onSubmit={(values) => onSave({ title: values.get('title'), owner: values.get('owner'), due: values.get('due') })}><label className="form-field">What's to do?<input name="title" placeholder="Order the extra chairs" required/></label><div className="form-grid"><label className="form-field">Who has it?<input name="owner" placeholder="Name" required defaultValue="You"/></label><label className="form-field">Due by<input name="due" type="date" required defaultValue={dateIn(3)}/></label></div></SimpleForm>;
}
function SimpleForm({ eyebrow, title, submitLabel, onCancel, onSubmit, children }) {
    return <form onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}><div className="modal-heading"><div><span className="section-label">{eyebrow}</span><h2>{title}</h2></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Close"><X size={18}/></button></div>{children}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{submitLabel} <ArrowRight size={15}/></button></div></form>;
}
export default App;

import { type FormEvent, useMemo, useState } from 'react'
import './App.css'

type DashboardSection = 'miembros' | 'entrenadores' | 'clases' | 'inscripciones'

type LoginForm = {
  email: string
  password: string
}

const sectionTitles: Record<DashboardSection, string> = {
  miembros: 'Miembros',
  entrenadores: 'Entrenadores',
  clases: 'Clases',
  inscripciones: 'Inscripciones',
}

const sectionVisuals: Record<DashboardSection, { icon: string; tagline: string }> = {
  miembros: { icon: 'users', tagline: 'Gestion de clientes, planes y renovaciones' },
  entrenadores: { icon: 'trainer', tagline: 'Equipo tecnico, especialidades y asignaciones' },
  clases: { icon: 'calendar', tagline: 'Programacion inteligente por tipo y sede' },
  inscripciones: { icon: 'check', tagline: 'Control de cupos, asistencia y penalizaciones' },
}

type PlanInfo = {
  nombre: string
  precio: string
  foco: string
  incluye: string[]
  noIncluye: string[]
}

type Member = {
  id: string
  nombre: string
  email: string
  plan: string
  estado: 'Activo' | 'Pendiente' | 'Suspendido'
  sede: string
}

type Trainer = {
  id: string
  nombre: string
  especialidad: string
  estado: 'Disponible' | 'En clase' | 'Descanso'
  sede: string
}

type GymClass = {
  id: string
  nombre: string
  categoria: string
  entrenador: string
  sede: string
  horario: string
  recurrente: string
  cupos: number
  inscritos: number
  planRequerido: string
}

type Enrollment = {
  id: string
  miembro: string
  clase: string
  estado: 'Confirmada' | 'Lista de espera' | 'No asistio'
  checkinQr: 'Si' | 'No'
}

type EntityType = 'member' | 'trainer' | 'class' | 'enrollment'

type ModalState = {
  open: boolean
  entity: EntityType | null
  mode: 'create' | 'edit'
  id: string | null
}

const planCatalog: PlanInfo[] = [
  {
    nombre: 'Plan Basico',
    precio: 'Bajo',
    foco: 'Personas que solo quieren entrenar',
    incluye: ['Horario limitado 6am - 4pm', 'Maquinas y pesas', 'Vestidores'],
    noIncluye: ['Clases grupales', 'Entrenador personalizado', 'Horas pico', 'Invitados'],
  },
  {
    nombre: 'Plan Estandar',
    precio: 'Medio',
    foco: 'Usuarios frecuentes',
    incluye: ['Acceso completo', 'Maquinas y pesas', '2-3 clases semanales', 'Vestidores'],
    noIncluye: ['Entrenador personal constante', 'Acceso VIP', 'Invitados ilimitados'],
  },
  {
    nombre: 'Plan Premium',
    precio: 'Alto',
    foco: 'Experiencia completa',
    incluye: [
      'Acceso ilimitado',
      'Todas las clases',
      '1-2 sesiones con entrenador al mes',
      'Zonas especiales',
      'Invitados ocasionales',
      'Lockers',
    ],
    noIncluye: ['Entrenador diario exclusivo'],
  },
  {
    nombre: 'Plan VIP / Elite',
    precio: 'Muy alto',
    foco: 'Usuarios exigentes',
    incluye: [
      'Todo el Premium',
      'Entrenador fijo',
      'Plan de alimentacion',
      'Zonas exclusivas',
      'Prioridad de reservas',
      'Invitados ilimitados',
      'Parqueadero',
    ],
    noIncluye: ['Sin restricciones relevantes'],
  },
  {
    nombre: 'Plan por Clases',
    precio: 'Variable',
    foco: 'Clientes orientados a clases',
    incluye: ['Acceso a clases especificas', 'Horarios definidos'],
    noIncluye: ['Uso libre del gym', 'Acceso total a pesas'],
  },
  {
    nombre: 'Plan Diario / Semanal',
    precio: 'Bajo por uso',
    foco: 'Visitantes ocasionales',
    incluye: ['Acceso por dia o semana', 'Uso basico del gym'],
    noIncluye: ['Beneficios premium', 'Seguimiento completo'],
  },
]

const classTypeOptions = [
  'Cardio - Spinning',
  'Cardio - Zumba',
  'Cardio - Aerobicos',
  'Cardio - Step',
  'Cardio - Dance fitness',
  'Fuerza - Body Pump',
  'Fuerza - Entrenamiento funcional',
  'Fuerza - Cross training',
  'Fuerza - TRX',
  'Mente-cuerpo - Yoga',
  'Mente-cuerpo - Pilates',
  'Mente-cuerpo - Stretching',
  'Mente-cuerpo - Meditacion guiada',
  'HIIT - HIIT',
  'HIIT - Tabata',
  'HIIT - Bootcamp',
  'Combate - Boxeo',
  'Combate - Kickboxing',
  'Combate - MMA basico',
  'Combate - Defensa personal',
  'Acuaticas - Aquagym',
  'Acuaticas - Natacion',
  'Acuaticas - Hidroterapia',
  'Especializadas - Adultos mayores',
  'Especializadas - Principiantes',
  'Especializadas - Rehabilitacion fisica',
  'Especializadas - Personalizadas',
]

const branchOptions = ['Sede Centro', 'Sede Norte', 'Sede Sur']

const data = {
  miembros: [
    {
      id: 'M-101',
      nombre: 'Ana Torres',
      email: 'ana@gym.com',
      plan: 'Plan Premium',
      estado: 'Activo',
      sede: 'Sede Centro',
    },
    {
      id: 'M-102',
      nombre: 'Carlos Rojas',
      email: 'carlos@gym.com',
      plan: 'Plan Basico',
      estado: 'Activo',
      sede: 'Sede Norte',
    },
    {
      id: 'M-103',
      nombre: 'Daniela Cruz',
      email: 'daniela@gym.com',
      plan: 'Plan Estandar',
      estado: 'Pendiente',
      sede: 'Sede Sur',
    },
  ] as Member[],
  entrenadores: [
    {
      id: 'T-21',
      nombre: 'Sofia Mejia',
      especialidad: 'Funcional',
      estado: 'Disponible',
      sede: 'Sede Centro',
    },
    {
      id: 'T-22',
      nombre: 'Luis Rivera',
      especialidad: 'Cross training',
      estado: 'En clase',
      sede: 'Sede Norte',
    },
    {
      id: 'T-23',
      nombre: 'Mateo Pena',
      especialidad: 'Yoga',
      estado: 'Disponible',
      sede: 'Sede Sur',
    },
  ] as Trainer[],
  clases: [
    {
      id: 'C-01',
      nombre: 'Spinning',
      categoria: 'Cardio - Spinning',
      entrenador: 'Sofia Mejia',
      sede: 'Sede Centro',
      horario: 'Lunes 7:00 PM',
      recurrente: 'Todos los lunes 7:00 PM',
      cupos: 24,
      inscritos: 18,
      planRequerido: 'Plan Estandar',
    },
    {
      id: 'C-02',
      nombre: 'Yoga Flow',
      categoria: 'Mente-cuerpo - Yoga',
      entrenador: 'Mateo Pena',
      sede: 'Sede Sur',
      horario: 'Martes 7:00 AM',
      recurrente: 'Mar/Jue 7:00 AM',
      cupos: 20,
      inscritos: 12,
      planRequerido: 'Plan Basico',
    },
    {
      id: 'C-03',
      nombre: 'HIIT',
      categoria: 'HIIT - HIIT',
      entrenador: 'Luis Rivera',
      sede: 'Sede Norte',
      horario: 'Jueves 5:30 PM',
      recurrente: 'Todos los jueves 5:30 PM',
      cupos: 20,
      inscritos: 20,
      planRequerido: 'Plan Premium',
    },
  ] as GymClass[],
  inscripciones: [
    { id: 'I-3001', miembro: 'Ana Torres', clase: 'Spinning', estado: 'Confirmada', checkinQr: 'Si' },
    {
      id: 'I-3002',
      miembro: 'Carlos Rojas',
      clase: 'HIIT',
      estado: 'Lista de espera',
      checkinQr: 'No',
    },
    {
      id: 'I-3003',
      miembro: 'Daniela Cruz',
      clase: 'Yoga Flow',
      estado: 'Confirmada',
      checkinQr: 'Si',
    },
  ] as Enrollment[],
}

function App() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [isLogged, setIsLogged] = useState(false)
  const [activeSection, setActiveSection] = useState<DashboardSection>('miembros')
  const [userName, setUserName] = useState('Usuario')
  const [members, setMembers] = useState<Member[]>(data.miembros)
  const [trainers, setTrainers] = useState<Trainer[]>(data.entrenadores)
  const [classes, setClasses] = useState<GymClass[]>(data.clases)
  const [enrollments, setEnrollments] = useState<Enrollment[]>(data.inscripciones)
  const [modal, setModal] = useState<ModalState>({
    open: false,
    entity: null,
    mode: 'create',
    id: null,
  })

  const [memberForm, setMemberForm] = useState({
    nombre: '',
    email: '',
    plan: planCatalog[0].nombre,
    estado: 'Activo' as Member['estado'],
    sede: branchOptions[0],
  })

  const [trainerForm, setTrainerForm] = useState({
    nombre: '',
    especialidad: '',
    estado: 'Disponible' as Trainer['estado'],
    sede: branchOptions[0],
  })

  const [classForm, setClassForm] = useState({
    nombre: '',
    categoria: classTypeOptions[0],
    entrenador: '',
    sede: branchOptions[0],
    horario: '',
    recurrente: 'Todos los lunes 7:00 PM',
    cupos: 20,
    planRequerido: planCatalog[0].nombre,
  })

  const [enrollmentForm, setEnrollmentForm] = useState({
    miembro: '',
    clase: '',
    estado: 'Confirmada' as Enrollment['estado'],
    checkinQr: 'Si' as Enrollment['checkinQr'],
  })

  const onChangeField = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.email || !form.password) return
    setUserName(form.email.split('@')[0] || 'Usuario')
    setIsLogged(true)
  }

  const onLogout = () => {
    setIsLogged(false)
    setForm({ email: '', password: '' })
    setActiveSection('miembros')
    setUserName('Usuario')
  }

  const sectionData = useMemo(() => {
    if (activeSection === 'miembros') return members
    if (activeSection === 'entrenadores') return trainers
    if (activeSection === 'clases') return classes
    return enrollments
  }, [activeSection, members, trainers, classes, enrollments])

  const totalMembers = members.length
  const totalTrainers = trainers.length
  const totalClasses = classes.length
  const totalEnrollments = enrollments.length
  const notAttended = enrollments.filter((item) => item.estado === 'No asistio').length

  const openCreateModal = (entity: EntityType) => {
    setModal({ open: true, entity, mode: 'create', id: null })
  }

  const openEditModal = (entity: EntityType, id: string) => {
    setModal({ open: true, entity, mode: 'edit', id })
  }

  const closeModal = () => {
    setModal({ open: false, entity: null, mode: 'create', id: null })
  }

  const addOrUpdateMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!memberForm.nombre || !memberForm.email) return

    if (modal.mode === 'edit' && modal.id) {
      setMembers((prev) =>
        prev.map((item) =>
          item.id === modal.id
            ? {
                ...item,
                nombre: memberForm.nombre,
                email: memberForm.email,
                plan: memberForm.plan,
                estado: memberForm.estado,
                sede: memberForm.sede,
              }
            : item,
        ),
      )
    } else {
      const newId = `M-${100 + members.length + 1}`
      setMembers((prev) => [...prev, { id: newId, ...memberForm }])
    }

    setMemberForm({
      nombre: '',
      email: '',
      plan: planCatalog[0].nombre,
      estado: 'Activo',
      sede: branchOptions[0],
    })
    closeModal()
  }

  const loadMemberToEdit = (member: Member) => {
    setMemberForm({
      nombre: member.nombre,
      email: member.email,
      plan: member.plan,
      estado: member.estado,
      sede: member.sede,
    })
    openEditModal('member', member.id)
  }

  const addOrUpdateTrainer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trainerForm.nombre || !trainerForm.especialidad) return

    if (modal.mode === 'edit' && modal.id) {
      setTrainers((prev) =>
        prev.map((item) =>
          item.id === modal.id
            ? {
                ...item,
                nombre: trainerForm.nombre,
                especialidad: trainerForm.especialidad,
                estado: trainerForm.estado,
                sede: trainerForm.sede,
              }
            : item,
        ),
      )
    } else {
      const newId = `T-${20 + trainers.length + 1}`
      setTrainers((prev) => [...prev, { id: newId, ...trainerForm }])
    }

    setTrainerForm({
      nombre: '',
      especialidad: '',
      estado: 'Disponible',
      sede: branchOptions[0],
    })
    closeModal()
  }

  const loadTrainerToEdit = (trainer: Trainer) => {
    setTrainerForm({
      nombre: trainer.nombre,
      especialidad: trainer.especialidad,
      estado: trainer.estado,
      sede: trainer.sede,
    })
    openEditModal('trainer', trainer.id)
  }

  const createClass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!classForm.nombre || !classForm.horario || !classForm.entrenador) return
    if (modal.mode === 'edit' && modal.id) {
      setClasses((prev) =>
        prev.map((item) => (item.id === modal.id ? { ...item, ...classForm } : item)),
      )
    } else {
      const newId = `C-${(classes.length + 1).toString().padStart(2, '0')}`
      setClasses((prev) => [...prev, { id: newId, inscritos: 0, ...classForm }])
    }
    setClassForm({
      nombre: '',
      categoria: classTypeOptions[0],
      entrenador: '',
      sede: branchOptions[0],
      horario: '',
      recurrente: 'Todos los lunes 7:00 PM',
      cupos: 20,
      planRequerido: planCatalog[0].nombre,
    })
    closeModal()
  }

  const createEnrollment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!enrollmentForm.miembro || !enrollmentForm.clase) return
    if (modal.mode === 'edit' && modal.id) {
      setEnrollments((prev) =>
        prev.map((item) => (item.id === modal.id ? { ...item, ...enrollmentForm } : item)),
      )
    } else {
      const newId = `I-${3000 + enrollments.length + 1}`
      setEnrollments((prev) => [...prev, { id: newId, ...enrollmentForm }])
    }
    setClasses((prev) =>
      prev.map((item) =>
        item.nombre === enrollmentForm.clase
          ? { ...item, inscritos: Math.min(item.cupos, item.inscritos + 1) }
          : item,
      ),
    )
    setEnrollmentForm({
      miembro: '',
      clase: '',
      estado: 'Confirmada',
      checkinQr: 'Si',
    })
    closeModal()
  }

  const loadClassToEdit = (selectedClass: GymClass) => {
    setClassForm({
      nombre: selectedClass.nombre,
      categoria: selectedClass.categoria,
      entrenador: selectedClass.entrenador,
      sede: selectedClass.sede,
      horario: selectedClass.horario,
      recurrente: selectedClass.recurrente,
      cupos: selectedClass.cupos,
      planRequerido: selectedClass.planRequerido,
    })
    openEditModal('class', selectedClass.id)
  }

  const loadEnrollmentToEdit = (selectedEnrollment: Enrollment) => {
    setEnrollmentForm({
      miembro: selectedEnrollment.miembro,
      clase: selectedEnrollment.clase,
      estado: selectedEnrollment.estado,
      checkinQr: selectedEnrollment.checkinQr,
    })
    openEditModal('enrollment', selectedEnrollment.id)
  }

  const deleteMember = (id: string) => setMembers((prev) => prev.filter((item) => item.id !== id))
  const deleteTrainer = (id: string) => setTrainers((prev) => prev.filter((item) => item.id !== id))
  const deleteClass = (id: string) => setClasses((prev) => prev.filter((item) => item.id !== id))
  const deleteEnrollment = (id: string) =>
    setEnrollments((prev) => prev.filter((item) => item.id !== id))

  const updateClassStatus = (id: string, status: string) => {
    setClasses((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, recurrente: `${item.recurrente} | Estado: ${status}` } : item,
      ),
    )
  }

  const modalTitleByEntity: Record<EntityType, string> = {
    member: 'Miembros',
    trainer: 'Entrenadores',
    class: 'Clases',
    enrollment: 'Inscripciones',
  }

  const renderIcon = (kind: string) => {
    if (kind === 'users') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 2c-3.314 0-6 1.79-6 4v2h9v-2c0-2.21-1.79-4-4-4Zm8 0c-.714 0-1.39.083-2 .235A5.979 5.979 0 0 1 16 17v2h6v-2c0-2.21-2.686-4-6-4Z" />
        </svg>
      )
    }
    if (kind === 'trainer') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 7h-3.17A3.001 3.001 0 0 0 14 5h-4a3.001 3.001 0 0 0-2.83 2H4v2h3.17A3.001 3.001 0 0 0 10 11h4a3.001 3.001 0 0 0 2.83-2H20V7Zm-6 2h-4V7h4v2ZM8 13a4 4 0 0 0-4 4v2h2v-2a2 2 0 0 1 4 0v2h2v-2a4 4 0 0 0-4-4Zm8 0a4 4 0 0 0-4 4v2h2v-2a2 2 0 0 1 4 0v2h2v-2a4 4 0 0 0-4-4Z" />
        </svg>
      )
    }
    if (kind === 'calendar') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10ZM6 8h12V6H6v2Z" />
        </svg>
      )
    }
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9.55 17.8-4.9-4.9 1.4-1.4 3.5 3.5 8.4-8.4 1.4 1.4-9.8 9.8Z" />
      </svg>
    )
  }

  if (!isLogged) {
    return (
      <main className="login">
        <div className="bg-orb bg-orb--a" />
        <div className="bg-orb bg-orb--b" />
        <section className="login__card">
          <p className="app__badge">Sistema de Gestion de Gimnasio</p>
          <h1>Iniciar sesion</h1>
          <p className="login__subtitle">
            Ingresa con tu usuario para consultar miembros, entrenadores, clases e inscripciones.
          </p>

          <form className="login__form" onSubmit={onLogin}>
            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChangeField('email', event.target.value)}
                placeholder="usuario@gym.com"
              />
            </label>
            <label>
              Contrasena
              <input
                type="password"
                value={form.password}
                onChange={(event) => onChangeField('password', event.target.value)}
                placeholder="********"
              />
            </label>
            <button type="submit">Entrar al panel</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <div className="bg-orb bg-orb--a" />
      <div className="bg-orb bg-orb--b" />
      <div className="bg-orb bg-orb--c" />
      <header className="app__header app__header--panel">
        <div>
          <p className="app__badge">Sistema de Gestion de Gimnasio</p>
          <h1>Administrador: {userName}</h1>
          <p className="app__subtitle">
            Gestiona usuarios, inscripciones, entrenadores y programacion de clases en tiempo real.
          </p>
        </div>
        <div className="header-actions">
          <span className="live-pill">En vivo</span>
          <button className="ghost-button" type="button" onClick={onLogout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className="kpi-grid">
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--stroke">{renderIcon('users')}</span>
          <div>
            <p className="kpi-card__label">Miembros activos</p>
            <h3>{totalMembers}</h3>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--stroke">{renderIcon('trainer')}</span>
          <div>
            <p className="kpi-card__label">Entrenadores</p>
            <h3>{totalTrainers}</h3>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--stroke">{renderIcon('calendar')}</span>
          <div>
            <p className="kpi-card__label">Clases semanales</p>
            <h3>{totalClasses}</h3>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--stroke">{renderIcon('check')}</span>
          <div>
            <p className="kpi-card__label">Inscripciones</p>
            <h3>{totalEnrollments}</h3>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--stroke">{renderIcon('check')}</span>
          <div>
            <p className="kpi-card__label">No asistieron</p>
            <h3>{notAttended}</h3>
          </div>
        </article>
      </section>

      <section className="workout-strip">
        <article className="workout-card">
          <h3>Ritmo del gimnasio</h3>
          <p>Monitorea energia, asistencia y ocupacion en tiempo real.</p>
          <div className="pulse-line" />
        </article>
        <article className="workout-card">
          <h3>Capacidad por clase</h3>
          <div className="capacity-list">
            {classes.map((item) => (
              <div key={item.id}>
                <div className="capacity-head">
                  <span>{item.nombre}</span>
                  <span>{Math.round((item.inscritos / item.cupos) * 100)}%</span>
                </div>
                <div className="capacity-track">
                  <div
                    className="capacity-fill"
                    style={{ width: `${Math.round((item.inscritos / item.cupos) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <nav className="tabs" aria-label="Secciones del panel">
        {(Object.keys(sectionTitles) as DashboardSection[]).map((section) => (
          <button
            key={section}
            type="button"
            className={section === activeSection ? 'tab tab--active' : 'tab'}
            onClick={() => setActiveSection(section)}
          >
            {sectionTitles[section]}
          </button>
        ))}
      </nav>

      <section className="panel">
        <div className="panel__header">
          <h2>
            <span className="section-icon">{renderIcon(sectionVisuals[activeSection].icon)}</span>{' '}
            {sectionTitles[activeSection]}
          </h2>
          <p>{sectionVisuals[activeSection].tagline}</p>
        </div>

        <div className="section-toolbar">
          {activeSection === 'miembros' && (
            <button type="button" className="primary-btn" onClick={() => openCreateModal('member')}>
              Nuevo miembro
            </button>
          )}
          {activeSection === 'entrenadores' && (
            <button type="button" className="primary-btn" onClick={() => openCreateModal('trainer')}>
              Nuevo entrenador
            </button>
          )}
          {activeSection === 'clases' && (
            <button type="button" className="primary-btn" onClick={() => openCreateModal('class')}>
              Programar clase
            </button>
          )}
          {activeSection === 'inscripciones' && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => openCreateModal('enrollment')}
            >
              Nueva inscripcion
            </button>
          )}
        </div>

        {activeSection === 'miembros' && (
          <section className="plan-cards">
            {planCatalog.map((plan) => (
              <article key={plan.nombre} className="plan-card">
                <h3>{plan.nombre}</h3>
                <p className="plan-price">Precio: {plan.precio}</p>
                <p className="plan-focus">{plan.foco}</p>
                <p className="plan-subtitle">Incluye</p>
                <ul>
                  {plan.incluye.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="plan-subtitle">No incluye</p>
                <ul>
                  {plan.noIncluye.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {Object.keys(sectionData[0]).map((column) => (
                  <th key={column}>{column}</th>
                ))}
                {(activeSection === 'miembros' ||
                  activeSection === 'entrenadores' ||
                  activeSection === 'clases' ||
                  activeSection === 'inscripciones') && (
                  <th>acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sectionData.map((row) => (
                <tr key={row.id}>
                  {Object.values(row).map((value) => (
                    <td key={`${row.id}-${value}`}>{value}</td>
                  ))}
                  {(activeSection === 'miembros' || activeSection === 'entrenadores') && (
                    <td>
                      <div className="action-group">
                        <button
                          className="mini-btn"
                          type="button"
                          onClick={() => {
                            if (activeSection === 'miembros') loadMemberToEdit(row as Member)
                            if (activeSection === 'entrenadores') loadTrainerToEdit(row as Trainer)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="mini-btn mini-btn--danger"
                          type="button"
                          onClick={() => {
                            if (activeSection === 'miembros') deleteMember((row as Member).id)
                            if (activeSection === 'entrenadores') deleteTrainer((row as Trainer).id)
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                  {activeSection === 'clases' && (
                    <td>
                      <div className="action-group">
                        <button
                          className="mini-btn"
                          type="button"
                          onClick={() => loadClassToEdit(row as GymClass)}
                        >
                          Editar
                        </button>
                        <button
                          className="mini-btn"
                          type="button"
                          onClick={() => updateClassStatus((row as GymClass).id, 'Pospuesta')}
                        >
                          Posponer
                        </button>
                        <button
                          className="mini-btn mini-btn--danger"
                          type="button"
                          onClick={() => updateClassStatus((row as GymClass).id, 'Cancelada')}
                        >
                          Cancelar
                        </button>
                        <button
                          className="mini-btn mini-btn--danger"
                          type="button"
                          onClick={() => deleteClass((row as GymClass).id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                  {activeSection === 'inscripciones' && (
                    <td>
                      <div className="action-group">
                        <button
                          className="mini-btn"
                          type="button"
                          onClick={() => loadEnrollmentToEdit(row as Enrollment)}
                        >
                          Editar
                        </button>
                        <button
                          className="mini-btn mini-btn--danger"
                          type="button"
                          onClick={() => deleteEnrollment((row as Enrollment).id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="extras-grid">
          <article>
            <h4>QR y control de acceso</h4>
            <p>Check-in QR, validacion por horario pico/valle y bloqueo por estado de plan.</p>
          </article>
          <article>
            <h4>Penalizacion por no asistir</h4>
            <p>Marca no asistencia y genera penalizacion automatica en la siguiente reserva.</p>
          </article>
          <article>
            <h4>Estadisticas de asistencia</h4>
            <p>Tendencia semanal por sede, clase y entrenador con alertas de baja ocupacion.</p>
          </article>
          <article>
            <h4>Renovacion automatica</h4>
            <p>Recordatorios y renovacion por plan para evitar interrupciones de membresia.</p>
          </article>
        </section>
      </section>

      {modal.open && (
        <div className="modal-backdrop">
          <section className="modal-card">
            <div className="modal-head">
              <h3>
                {modal.mode === 'edit' ? 'Editar registro' : 'Crear registro'} -{' '}
                {modal.entity ? modalTitleByEntity[modal.entity] : ''}
              </h3>
              <button type="button" className="mini-btn" onClick={closeModal}>
                Cerrar
              </button>
            </div>

            {modal.entity === 'member' && (
              <form className="admin-form" onSubmit={addOrUpdateMember}>
                <input
                  placeholder="Nombre del miembro"
                  value={memberForm.nombre}
                  onChange={(event) =>
                    setMemberForm((prev) => ({ ...prev, nombre: event.target.value }))
                  }
                />
                <input
                  placeholder="Correo"
                  value={memberForm.email}
                  onChange={(event) =>
                    setMemberForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <select
                  value={memberForm.plan}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, plan: event.target.value }))}
                >
                  {planCatalog.map((item) => (
                    <option key={item.nombre} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={memberForm.estado}
                  onChange={(event) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      estado: event.target.value as Member['estado'],
                    }))
                  }
                >
                  <option value="Activo">Activo</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
                <select
                  value={memberForm.sede}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, sede: event.target.value }))}
                >
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                <button type="submit">{modal.mode === 'edit' ? 'Guardar cambios' : 'Agregar'}</button>
              </form>
            )}

            {modal.entity === 'trainer' && (
              <form className="admin-form" onSubmit={addOrUpdateTrainer}>
                <input
                  placeholder="Nombre del entrenador"
                  value={trainerForm.nombre}
                  onChange={(event) =>
                    setTrainerForm((prev) => ({ ...prev, nombre: event.target.value }))
                  }
                />
                <input
                  placeholder="Especialidad"
                  value={trainerForm.especialidad}
                  onChange={(event) =>
                    setTrainerForm((prev) => ({ ...prev, especialidad: event.target.value }))
                  }
                />
                <select
                  value={trainerForm.estado}
                  onChange={(event) =>
                    setTrainerForm((prev) => ({
                      ...prev,
                      estado: event.target.value as Trainer['estado'],
                    }))
                  }
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En clase">En clase</option>
                  <option value="Descanso">Descanso</option>
                </select>
                <select
                  value={trainerForm.sede}
                  onChange={(event) => setTrainerForm((prev) => ({ ...prev, sede: event.target.value }))}
                >
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                <button type="submit">{modal.mode === 'edit' ? 'Guardar cambios' : 'Agregar'}</button>
              </form>
            )}

            {modal.entity === 'class' && (
              <form className="admin-form admin-form--wide" onSubmit={createClass}>
                <input
                  placeholder="Nombre de clase"
                  value={classForm.nombre}
                  onChange={(event) => setClassForm((prev) => ({ ...prev, nombre: event.target.value }))}
                />
                <select
                  value={classForm.categoria}
                  onChange={(event) =>
                    setClassForm((prev) => ({ ...prev, categoria: event.target.value }))
                  }
                >
                  {classTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={classForm.entrenador}
                  onChange={(event) =>
                    setClassForm((prev) => ({ ...prev, entrenador: event.target.value }))
                  }
                >
                  <option value="">Asignar entrenador</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.nombre}>
                      {trainer.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={classForm.sede}
                  onChange={(event) => setClassForm((prev) => ({ ...prev, sede: event.target.value }))}
                >
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Horario (ej: Lunes 7:00 PM)"
                  value={classForm.horario}
                  onChange={(event) => setClassForm((prev) => ({ ...prev, horario: event.target.value }))}
                />
                <input
                  placeholder="Clase recurrente (ej: Todos los lunes 7pm)"
                  value={classForm.recurrente}
                  onChange={(event) =>
                    setClassForm((prev) => ({ ...prev, recurrente: event.target.value }))
                  }
                />
                <input
                  type="number"
                  min={1}
                  value={classForm.cupos}
                  onChange={(event) =>
                    setClassForm((prev) => ({ ...prev, cupos: Number(event.target.value) }))
                  }
                />
                <select
                  value={classForm.planRequerido}
                  onChange={(event) =>
                    setClassForm((prev) => ({ ...prev, planRequerido: event.target.value }))
                  }
                >
                  {planCatalog.map((item) => (
                    <option key={item.nombre} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                <button type="submit">
                  {modal.mode === 'edit' ? 'Guardar cambios' : 'Crear y asignar'}
                </button>
              </form>
            )}

            {modal.entity === 'enrollment' && (
              <form className="admin-form admin-form--wide" onSubmit={createEnrollment}>
                <select
                  value={enrollmentForm.miembro}
                  onChange={(event) =>
                    setEnrollmentForm((prev) => ({ ...prev, miembro: event.target.value }))
                  }
                >
                  <option value="">Selecciona miembro</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.nombre}>
                      {member.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={enrollmentForm.clase}
                  onChange={(event) =>
                    setEnrollmentForm((prev) => ({ ...prev, clase: event.target.value }))
                  }
                >
                  <option value="">Selecciona clase</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={enrollmentForm.estado}
                  onChange={(event) =>
                    setEnrollmentForm((prev) => ({
                      ...prev,
                      estado: event.target.value as Enrollment['estado'],
                    }))
                  }
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Lista de espera">Lista de espera</option>
                  <option value="No asistio">No asistio</option>
                </select>
                <select
                  value={enrollmentForm.checkinQr}
                  onChange={(event) =>
                    setEnrollmentForm((prev) => ({
                      ...prev,
                      checkinQr: event.target.value as Enrollment['checkinQr'],
                    }))
                  }
                >
                  <option value="Si">Check-in QR: Si</option>
                  <option value="No">Check-in QR: No</option>
                </select>
                <button type="submit">{modal.mode === 'edit' ? 'Guardar cambios' : 'Registrar'}</button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default App

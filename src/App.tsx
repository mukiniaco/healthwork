import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ClipboardList, 
  ArrowRight, 
  ArrowLeft, 
  LogOut,
  Loader2,
  Plus,
  Trash2,
  MessageSquare,
  Heart,
  Share2,
  User,
  Home,
  Bell,
  Search,
  Send,
  Moon,
  Sun,
  Settings,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Lock
} from 'lucide-react';
import { cn } from './lib/utils';
import { CompanyData, RiskInput, RiskClassification, ActionPlan, Post, UserProfile } from './types';
import { analyzeFreeTextRisk, generateActionPlanFromAnalysis } from './services/gemini';

type AppState = 'login' | 'register_company' | 'register_risks' | 'register_classification' | 'register_actionPlan' | 'feed' | 'profile' | 'settings' | 'edit_profile' | 'notifications' | 'search';

export default function App() {
  const [state, setState] = useState<AppState>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'create' | 'notifications' | 'profile'>('home');

  // Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    privacyMode: false
  });

  // Registration States
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    cnpj: '',
    cnae: '',
    address: '',
    city: '',
    state: '',
    contact: '',
    sector: '',
    role: ''
  });
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [riskInput, setRiskInput] = useState<RiskInput>({ freeText: '' });
  const [classification, setClassification] = useState<RiskClassification | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan[]>([]);

  // Feed States
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      authorId: 'a1',
      authorName: 'Carlos Silva',
      authorRole: 'Técnico em Edificações',
      content: 'Hoje realizamos uma inspeção de rotina nos andaimes. Lembrem-se: a trava de segurança é inegociável! 👷‍♂️🛡️ #SegurancaDoTrabalho #CanteiroDeObras',
      timestamp: '2h atrás',
      likes: 24,
      reposts: 0,
      comments: [],
      tags: ['Seguranca', 'Obras']
    },
    {
      id: '2',
      authorId: 'a2',
      authorName: 'Ana Oliveira',
      authorRole: 'Engenheira de Segurança',
      content: 'Dica do dia: Pausas ativas para quem trabalha em escritório reduzem em 40% as chances de LER/DORT. Vamos nos cuidar! 💻🧘‍♀️',
      timestamp: '5h atrás',
      likes: 56,
      reposts: 0,
      comments: [
        { id: 'c1', authorName: 'João Paulo', content: 'Ótima dica, Ana! Começando agora.', timestamp: '1h atrás' }
      ],
      tags: ['Ergonomia', 'SaudeMental']
    }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [editProfileData, setEditProfileData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login
    setTimeout(() => {
      setState('feed');
      setUser({
        id: '1',
        name: 'Carlos Silva',
        email: 'carlos@healthwork.com',
        company: {
          name: 'Construtora ABC',
          cnpj: '12.345.678/0001-90',
          cnae: '4120-4/00',
          address: 'Av. Paulista, 1000',
          city: 'São Paulo',
          state: 'SP',
          contact: '(11) 98765-4321',
          sector: 'Construção Civil',
          role: 'Técnico em Edificações'
        },
        riskProfile: {
          level: 'Médio',
          score: 45,
          justification: 'Ambiente de obra com riscos físicos e ergonômicos controlados.',
          detectedRisks: ['Queda de altura', 'Ruído excessivo']
        },
        actionPlan: []
      });
      setLoading(false);
    }, 1000);
  };

  const handleAnalyzeRisks = async () => {
    if (!riskInput.freeText.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeFreeTextRisk(riskInput);
      setClassification(result);
      setState('register_classification');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!classification) return;
    setLoading(true);
    try {
      const plan = await generateActionPlanFromAnalysis(classification);
      setActionPlan(plan);
      setState('register_actionPlan');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finalizeRegistration = () => {
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: accountData.name,
      email: accountData.email,
      password: accountData.password,
      company: companyData,
      riskProfile: classification!,
      actionPlan: actionPlan
    };
    setUser(newUser);
    setState('feed');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
          likedByMe: !post.likedByMe
        };
      }
      return post;
    }));
  };

  const handleRepost = (postId: string) => {
    const postToRepost = posts.find(p => p.id === postId);
    if (!postToRepost || !user) return;

    if (postToRepost.repostedByMe) {
      setPosts(posts.map(p => p.id === postId ? { ...p, reposts: p.reposts - 1, repostedByMe: false } : p));
      return;
    }

    const newRepost: Post = {
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      authorRole: user.company.role,
      authorAvatar: user.avatar,
      content: `Compartilhou um post de ${postToRepost.authorName}`,
      timestamp: 'Agora',
      likes: 0,
      reposts: 0,
      comments: [],
      tags: [],
      repostedFrom: {
        authorName: postToRepost.authorName,
        content: postToRepost.content
      }
    };

    setPosts([newRepost, ...posts.map(p => p.id === postId ? { ...p, reposts: p.reposts + 1, repostedByMe: true } : p)]);
  };

  const handleReply = (postId: string, content: string) => {
    if (!content.trim() || !user) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now().toString(),
              authorName: user.name,
              content,
              timestamp: 'Agora'
            }
          ]
        };
      }
      return post;
    }));
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editProfileData) return;
    setUser(editProfileData);
    
    setPosts(posts.map(post => {
      if (post.authorId === user.id) {
        return {
          ...post,
          authorName: editProfileData.name,
          authorRole: editProfileData.company.role,
          authorAvatar: editProfileData.avatar
        };
      }
      return post;
    }));

    setState('profile');
  };

  const startEditingProfile = () => {
    setEditProfileData(user);
    setState('edit_profile');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      authorRole: user.company.role,
      authorAvatar: user.avatar,
      content: newPostContent,
      timestamp: 'Agora',
      likes: 0,
      reposts: 0,
      comments: [],
      tags: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const renderRegistrationProgress = () => {
    const steps = [
      { key: 'register_company', icon: Building2 },
      { key: 'register_risks', icon: AlertTriangle },
      { key: 'register_classification', icon: CheckCircle2 },
      { key: 'register_actionPlan', icon: ClipboardList },
    ];

    return (
      <div className="flex items-center justify-center mb-8 space-x-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = state === s.key;
          const isPast = steps.findIndex(x => x.key === state) > i;

          return (
            <React.Fragment key={s.key}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                isActive ? "border-blue-600 bg-blue-50 text-blue-600" : 
                isPast ? "border-green-500 bg-green-50 text-green-500" : "border-slate-200 text-slate-300"
              )}>
                <Icon size={16} />
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5",
                  isPast ? "bg-green-500" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans transition-colors duration-300",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">HealthWork</h1>
        </div>
        
        {(state === 'feed' || state === 'search' || state === 'notifications') && (
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar riscos, EPIs, normas..." 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {state === 'feed' || state === 'profile' || state === 'settings' || state === 'search' || state === 'notifications' ? (
            <>
              <button 
                onClick={() => setState('settings')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={() => setState('profile')}
                className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs overflow-hidden"
              >
                {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
              </button>
            </>
          ) : null}
          {state !== 'login' && (
            <button 
              onClick={() => { setUser(null); setState('login'); }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {state === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mt-12"
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">HealthWork Social</h2>
                  <p className="text-slate-500 mt-2">A comunidade de quem faz o trabalho seguro.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="email" required className="input-field" placeholder="E-mail" defaultValue="trabalhador@healthwork.com" />
                  <input type="password" required className="input-field" placeholder="Senha" defaultValue="123456" />
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2 py-3">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Entrar</span>}
                  </button>
                </form>
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500">Novo por aqui? <button onClick={() => setState('register_company')} className="text-blue-600 font-bold hover:underline">Criar conta</button></p>
                </div>
              </div>
            </motion.div>
          )}

          {state.startsWith('register_') && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              {renderRegistrationProgress()}

              {state === 'register_company' && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-bold mb-2 dark:text-white">Crie sua conta</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Preencha os dados da empresa e seus dados de acesso.</p>
                  
                  <div className="space-y-6">
                    {/* Account Data */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Dados de Acesso</h3>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                        <input 
                          className="input-field" 
                          value={accountData.name}
                          onChange={e => setAccountData({...accountData, name: e.target.value})}
                          placeholder="Seu nome"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
                          <input 
                            className="input-field" 
                            type="email"
                            value={accountData.email}
                            onChange={e => setAccountData({...accountData, email: e.target.value})}
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Senha</label>
                          <input 
                            className="input-field" 
                            type="password"
                            value={accountData.password}
                            onChange={e => setAccountData({...accountData, password: e.target.value})}
                            placeholder="******"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Data */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Dados da Empresa</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Nome da Empresa</label>
                          <input 
                            className="input-field" 
                            value={companyData.name}
                            onChange={e => setCompanyData({...companyData, name: e.target.value})}
                            placeholder="Ex: Construtora ABC"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">CNPJ</label>
                          <input 
                            className="input-field" 
                            value={companyData.cnpj}
                            onChange={e => setCompanyData({...companyData, cnpj: e.target.value})}
                            placeholder="00.000.000/0001-00"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">CNAE</label>
                          <input 
                            className="input-field" 
                            value={companyData.cnae}
                            onChange={e => setCompanyData({...companyData, cnae: e.target.value})}
                            placeholder="Ex: 4120-4/00"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Contato/Telefone</label>
                          <input 
                            className="input-field" 
                            value={companyData.contact}
                            onChange={e => setCompanyData({...companyData, contact: e.target.value})}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Endereço Completo</label>
                        <input 
                          className="input-field" 
                          value={companyData.address}
                          onChange={e => setCompanyData({...companyData, address: e.target.value})}
                          placeholder="Rua, número, bairro..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Cidade</label>
                          <input 
                            className="input-field" 
                            value={companyData.city}
                            onChange={e => setCompanyData({...companyData, city: e.target.value})}
                            placeholder="Ex: São Paulo"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Estado</label>
                          <input 
                            className="input-field" 
                            value={companyData.state}
                            onChange={e => setCompanyData({...companyData, state: e.target.value})}
                            placeholder="Ex: SP"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Setor</label>
                          <input 
                            className="input-field" 
                            value={companyData.sector}
                            onChange={e => setCompanyData({...companyData, sector: e.target.value})}
                            placeholder="Ex: Logística"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Seu Cargo</label>
                          <input 
                            className="input-field" 
                            value={companyData.role}
                            onChange={e => setCompanyData({...companyData, role: e.target.value})}
                            placeholder="Ex: Operador"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setState('register_risks')}
                      disabled={!companyData.name || !companyData.role || !accountData.email || !accountData.password}
                      className="btn-primary flex items-center space-x-2 px-6"
                    >
                      <span>Próximo</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {state === 'register_risks' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-2">Quais riscos você enfrenta?</h2>
                  <p className="text-slate-500 text-sm mb-6">Descreva livremente o seu dia a dia e o que te preocupa em termos de segurança.</p>
                  
                  <textarea 
                    className="input-field min-h-[200px] resize-none p-4 leading-relaxed"
                    placeholder="Ex: Trabalho operando uma prensa hidráulica que faz muito barulho. Às vezes sinto que a proteção lateral está frouxa e o chão fica escorregadio por causa do óleo..."
                    value={riskInput.freeText}
                    onChange={e => setRiskInput({ freeText: e.target.value })}
                  />

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setState('register_company')} className="btn-secondary flex items-center space-x-2">
                      <ArrowLeft size={18} />
                      <span>Voltar</span>
                    </button>
                    <button 
                      onClick={handleAnalyzeRisks}
                      disabled={!riskInput.freeText.trim() || loading}
                      className="btn-primary flex items-center space-x-2 px-6"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                          <span>Analisar com IA</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {state === 'register_classification' && classification && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-2">Análise do seu Perfil</h2>
                  <p className="text-slate-500 text-sm mb-6">Nossa IA identificou os seguintes pontos no seu relato:</p>

                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {classification.detectedRisks.map((r, i) => (
                        <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                          {r}
                        </span>
                      ))}
                    </div>

                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between",
                      classification.level === 'Crítico' ? "bg-red-50 border-red-100 text-red-700" :
                      classification.level === 'Alto' ? "bg-orange-50 border-orange-100 text-orange-700" :
                      "bg-green-50 border-green-100 text-green-700"
                    )}>
                      <div className="flex items-center space-x-3">
                        <AlertTriangle size={24} />
                        <div>
                          <div className="font-bold uppercase text-xs tracking-wider">Nível de Risco</div>
                          <div className="text-lg font-black">{classification.level}</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black opacity-20">#{classification.score}</div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl text-sm text-slate-600 leading-relaxed italic border border-slate-100">
                      "{classification.justification}"
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setState('register_risks')} className="btn-secondary flex items-center space-x-2">
                      <ArrowLeft size={18} />
                      <span>Voltar</span>
                    </button>
                    <button 
                      onClick={handleGeneratePlan}
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2 px-6"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                          <span>Ver Recomendações</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {state === 'register_actionPlan' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-2">Seu Plano de Proteção</h2>
                  <p className="text-slate-500 text-sm mb-6">Sugerimos estas ações para garantir sua segurança no dia a dia.</p>

                  <div className="space-y-4">
                    {actionPlan.map((p, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-sm">{p.measure}</div>
                          <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <span>{p.responsible}</span>
                            <span>•</span>
                            <span>{p.deadline}</span>
                            <span>•</span>
                            <span className={cn(
                              p.priority === 'Alta' ? "text-red-500" : "text-blue-500"
                            )}>{p.priority}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setState('register_classification')} className="btn-secondary flex items-center space-x-2">
                      <ArrowLeft size={18} />
                      <span>Voltar</span>
                    </button>
                    <button 
                      onClick={finalizeRegistration}
                      className="btn-primary flex items-center space-x-2 px-8"
                    >
                      <span>Entrar na Rede</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {state === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[60vh]">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Pesquisar</h2>
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Pesquisar por pessoas, riscos, empresas..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="text-center text-slate-500 dark:text-slate-400 mt-16">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Digite algo para começar a pesquisar.</p>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[60vh]">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notificações</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 dark:text-white"><span className="font-bold">Ana Oliveira</span> curtiu seu post.</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Há 2 horas</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 dark:text-white"><span className="font-bold">Carlos Silva</span> comentou no seu post.</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Há 5 horas</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <Share2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 dark:text-white"><span className="font-bold">Ana Oliveira</span> compartilhou seu post.</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Há 1 dia</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">{user?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{user?.company.role} em {user?.company.name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user?.riskProfile.level === 'Crítico' ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                      )}>
                        Risco: {user?.riskProfile.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informações Profissionais</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                        <Building2 size={16} className="text-blue-500" />
                        <span>{user?.company.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin size={16} className="text-blue-500" />
                        <span>{user?.company.city}, {user?.company.state}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                        <Phone size={16} className="text-blue-500" />
                        <span>{user?.company.contact}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bio</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      {user?.bio ? `"${user.bio}"` : '"Dedicado à segurança no trabalho e à proteção de todos os colegas de equipe."'}
                    </p>
                    <button className="btn-secondary w-full flex items-center justify-center space-x-2 text-xs" onClick={startEditingProfile}>
                      <Edit3 size={14} />
                      <span>Editar Perfil</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Seu Plano de Ação</h3>
                  <div className="space-y-3">
                    {user?.actionPlan.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-medium dark:text-slate-200">{p.measure}</span>
                        <span className="text-[10px] font-bold text-blue-500">{p.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button onClick={() => setState('feed')} className="btn-primary px-8">
                    Voltar para o Feed
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'edit_profile' && editProfileData && (
            <motion.div
              key="edit_profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Editar Perfil</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
                        {editProfileData.avatar ? <img src={editProfileData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : editProfileData.name.charAt(0)}
                      </div>
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Edit3 size={24} className="text-white" />
                        <input type="file" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditProfileData({ ...editProfileData, avatar: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Clique para mudar a foto</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                      <input className="input-field" value={editProfileData.name} onChange={e => setEditProfileData({ ...editProfileData, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Cargo</label>
                      <input className="input-field" value={editProfileData.company.role} onChange={e => setEditProfileData({ ...editProfileData, company: { ...editProfileData.company, role: e.target.value } })} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bio</label>
                    <textarea className="input-field min-h-[100px]" value={editProfileData.bio || ''} onChange={e => setEditProfileData({ ...editProfileData, bio: e.target.value })} placeholder="Conte um pouco sobre você..." />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setState('profile')} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar Alterações</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {state === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Configurações</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                      </div>
                      <div>
                        <div className="font-bold text-sm dark:text-white">Modo Escuro</div>
                        <div className="text-[10px] text-slate-400">Alternar tema visual</div>
                      </div>
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isDarkMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        isDarkMode ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <Mail size={18} className="text-slate-400" />
                        <span className="text-sm font-medium dark:text-slate-200">Notificações por E-mail</span>
                      </div>
                      <button 
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={cn("w-10 h-5 rounded-full relative transition-all", settings.emailNotifications ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700")}
                      >
                        <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", settings.emailNotifications ? "left-[22px]" : "left-0.5")} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <Bell size={18} className="text-slate-400" />
                        <span className="text-sm font-medium dark:text-slate-200">Notificações Push</span>
                      </div>
                      <button 
                        onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                        className={cn("w-10 h-5 rounded-full relative transition-all", settings.pushNotifications ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700")}
                      >
                        <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", settings.pushNotifications ? "left-[22px]" : "left-0.5")} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <Lock size={18} className="text-slate-400" />
                        <span className="text-sm font-medium dark:text-slate-200">Modo Privado</span>
                      </div>
                      <button 
                        onClick={() => setSettings({ ...settings, privacyMode: !settings.privacyMode })}
                        className={cn("w-10 h-5 rounded-full relative transition-all", settings.privacyMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700")}
                      >
                        <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", settings.privacyMode ? "left-[22px]" : "left-0.5")} />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setUser(null); setState('login'); }}
                    className="w-full btn-secondary text-red-500 border-red-100 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sair da Conta
                  </button>
                </div>

                <div className="mt-8 flex justify-center">
                  <button onClick={() => setState('feed')} className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors">
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {state === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Left Sidebar - Profile Summary */}
              <div className="hidden md:block space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-blue-100 overflow-hidden">
                      {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.company.role} em {user?.company.name}</p>
                  </div>
                  
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Nível de Risco</span>
                      <span className={cn(
                        "font-bold",
                        user?.riskProfile.level === 'Crítico' ? "text-red-500" : "text-green-500"
                      )}>{user?.riskProfile.level}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          user?.riskProfile.level === 'Crítico' ? "bg-red-500" : "bg-green-500"
                        )} 
                        style={{ width: `${(user?.riskProfile.score || 0) * 4}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="md:col-span-2 space-y-6">
                {/* Create Post */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 overflow-hidden">
                        {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                      </div>
                      <textarea 
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[80px] dark:text-white placeholder:text-slate-400"
                        placeholder="O que está acontecendo na sua frente de trabalho?"
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center pl-13">
                      <div className="flex space-x-2">
                        <button type="button" className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          <Shield size={18} />
                        </button>
                        <button type="button" className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          <AlertTriangle size={18} />
                        </button>
                      </div>
                      <button 
                        type="submit" 
                        disabled={!newPostContent.trim()}
                        className="btn-primary py-1.5 px-6 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>Postar</span>
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {posts.map(post => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                            {post.authorAvatar ? <img src={post.authorAvatar} alt="Avatar" className="w-full h-full object-cover" /> : post.authorName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{post.authorName}</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{post.authorRole} • {post.timestamp}</div>
                          </div>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600">
                          <Plus size={20} />
                        </button>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">#{tag}</span>
                        ))}
                      </div>

                      {post.repostedFrom && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Repostado de {post.repostedFrom.authorName}</div>
                          <p className="text-slate-600 dark:text-slate-300 text-xs italic">"{post.repostedFrom.content}"</p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center space-x-6">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            "flex items-center space-x-2 transition-colors",
                            post.likedByMe ? "text-red-500" : "text-slate-400 hover:text-red-500"
                          )}
                        >
                          <Heart size={18} fill={post.likedByMe ? "currentColor" : "none"} />
                          <span className="text-xs font-bold">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-400 hover:text-blue-500 transition-colors" onClick={() => {
                          setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                        }}>
                          <MessageSquare size={18} />
                          <span className="text-xs font-bold">{post.comments.length}</span>
                        </button>
                        <button 
                          onClick={() => handleRepost(post.id)}
                          className={cn(
                            "flex items-center space-x-2 transition-colors",
                            post.repostedByMe ? "text-green-500" : "text-slate-400 hover:text-green-500"
                          )}
                        >
                          <Share2 size={18} />
                          <span className="text-xs font-bold">{post.reposts}</span>
                        </button>
                      </div>

                      {expandedComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                          <div className="flex space-x-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 text-xs overflow-hidden">
                              {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                            </div>
                            <div className="flex-1 flex space-x-2">
                              <input 
                                type="text"
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder:text-slate-400"
                                placeholder="Adicione um comentário..."
                                value={commentInputs[post.id] || ''}
                                onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    handleReply(post.id, commentInputs[post.id] || '');
                                  }
                                }}
                              />
                              <button 
                                onClick={() => handleReply(post.id, commentInputs[post.id] || '')}
                                disabled={!commentInputs[post.id]?.trim()}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          </div>

                          {post.comments.map(comment => (
                            <div key={comment.id} className="flex space-x-3">
                              <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                                {comment.authorName.charAt(0)}
                              </div>
                              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                                <div className="font-bold text-slate-900 dark:text-white text-[10px]">{comment.authorName}</div>
                                <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      {(state === 'feed' || state === 'profile' || state === 'settings' || state === 'search' || state === 'notifications') && (
        <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center sticky bottom-0 z-50">
          <button 
            onClick={() => { setState('feed'); setActiveTab('home'); }}
            className={cn(state === 'feed' ? "text-blue-600" : "text-slate-400")}
          >
            <Home size={24} />
          </button>
          <button 
            onClick={() => { setState('search'); setActiveTab('search'); }}
            className={cn(state === 'search' ? "text-blue-600" : "text-slate-400")}
          >
            <Search size={24} />
          </button>
          <button 
            onClick={() => { setState('feed'); setActiveTab('create'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={cn(activeTab === 'create' ? "text-blue-600" : "text-slate-400")}
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={() => { setState('notifications'); setActiveTab('notifications'); }}
            className={cn(state === 'notifications' ? "text-blue-600" : "text-slate-400")}
          >
            <Bell size={24} />
          </button>
          <button 
            onClick={() => { setState('profile'); setActiveTab('profile'); }}
            className={cn(state === 'profile' ? "text-blue-600" : "text-slate-400")}
          >
            <User size={24} />
          </button>
        </nav>
      )}
    </div>
  );
}

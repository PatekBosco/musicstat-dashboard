import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, ArrowDownUp, LayoutDashboard, Music2, Download, SlidersHorizontal, Search, LockKeyhole, Star, ChevronRight, AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase'; // Подключаем наш созданный клиент базы
import cover from '@/assets/love-me-cover.jpg';

// Описываем структуру трека, как в нашей базе данных Supabase
interface Track {
  id: number;
  title: string;
  style: string;
  plays: number;
  downloads: number;
  rating: number;
  is_locked: boolean;
}

export const Route = createFileRoute('/')({
 head: () => ({
  meta: [
    { title: 'MusicStat | Аналитика patekharmonie' },
    { name: 'description', content: 'Музыкальный дашборд для мониторинга треков, прослушиваний, скачиваний и рейтинга с PromoDJ.' },
    { property: 'og:title', content: 'MusicStat | Аналитика patekharmonie' },
    { property: 'og:type', content: 'website' }
  ]
 }),
 component: MusicDashboard,
});

function MusicDashboard() {
 const [tab, setTab] = useState<'dashboard' | 'tracks'>('dashboard');
 const [search, setSearch] = useState(''); 
 const [genre, setGenre] = useState('all');
 const [sort, setSort] = useState<'plays' | 'downloads' | 'rating'>('plays');
 const [descending, setDescending] = useState(true);
 const [notice, setNotice] = useState('');
 
 // Новые состояния для живых данных из базы
 const [tracks, setTracks] = useState<Track[]>([]);
 const [loading, setLoading] = useState(true);
 const [summary, setSummary] = useState({ listens: 0, downloads: 0, conversion: '0' });

 // Загружаем данные из Supabase при старте страницы
 useEffect(() => {
   async function fetchData() {
     try {
       setLoading(true);
       
       // Делаем SQL-запрос через JS-клиент к нашей таблице my_tracks
       const { data, error } = await supabase
         .from('my_tracks')
         .select('*');

       if (error) throw error;

       if (data) {
         setTracks(data);

         // Считаем общую продуктовую аналитику (KPI) прямо на лету
         const totalListens = data.reduce((sum, t) => sum + (t.plays || 0), 0);
         const totalDownloads = data.reduce((sum, t) => sum + (t.downloads || 0), 0);
         const totalConversion = totalListens > 0 
           ? ((totalDownloads / totalListens) * 100).toFixed(1) 
           : '0';

         setSummary({
           listens: totalListens,
           downloads: totalDownloads,
           conversion: totalConversion
         });
       }
     } catch (err) {
       console.error('Ошибка загрузки данных из Supabase:', err);
     } finally {
       setLoading(false);
     }
   }

   fetchData();
 }, []);

 const changeSort = (key: typeof sort) => {
   if (sort === key) setDescending(!descending);
   else { setSort(key); setDescending(true); }
 };

 // Фильтрация и сортировка данных
 const filtered = tracks
   .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) && (genre === 'all' || t.style === genre))
   .sort((a, b) => (a[sort] - b[sort]) * (descending ? -1 : 1));

 const stats = [
   { label: 'Всего прослушиваний', value: summary.listens, icon: Music2, caption: 'За всё время' },
   { label: 'Всего скачиваний', value: summary.downloads, icon: Download, caption: 'За всё время' },
   { label: 'Конверсия в скачивание', value: `${summary.conversion}%`, icon: SlidersHorizontal, caption: 'От числа прослушиваний' }
 ];

 if (loading) {
   return (
     <div className="flex min-h-screen items-center justify-center bg-[#0b0c10] text-white">
       <div className="text-center">
         <AudioLines className="mx-auto animate-pulse text-[#45f3ff]" size={48} />
         <p className="mt-4 text-sm text-muted-foreground">Загрузка аналитики из Supabase...</p>
       </div>
     </div>
   );
 }

 return (
  <div className="app-shell">
   <aside className="sidebar">
    <div className="brand">
      <span className="brand-mark" aria-hidden="true"><i/><i/><i/><i/></span>
      MusicStat
    </div>
    <p className="nav-label">ЛИЧНЫЙ КАБИНЕТ</p>
    <nav aria-label="Основная навигация">
      <Button variant={tab==='dashboard'?'default':'ghost'} className="nav-button" onClick={()=>setTab('dashboard')} aria-current={tab==='dashboard'?'page':undefined}><LayoutDashboard/>Дашборд<ArrowRight/></Button>
      <Button variant={tab==='tracks'?'default':'ghost'} className="nav-button" onClick={()=>setTab('tracks')} aria-current={tab==='tracks'?'page':undefined}><Music2/>Мои треки<ArrowRight/></Button>
    </nav>
    <div className="sidebar-bottom">
      <div className="artist-profile">
        <div className="avatar">pk</div>
        <div className="min-w-0"><strong>patekharmonie</strong><p>Аккаунт музыканта</p></div>
      </div>
    </div>
   </aside>

   <main className="main-content">
    <div className="topline">
      <span>Личный кабинет <ChevronRight size={11} className="inline mx-2"/>{tab==='dashboard'?'Дашборд':'Мои треки'}</span>
      <span className="live-label"><span className="status-dot"/>База данных подключена</span>
    </div>
    
    <header className="heading-row">
      <div className="min-w-0">
        <h1>{tab==='dashboard'?'Аналитика музыканта':'Мои треки'}</h1>
        <p>{tab==='dashboard'?'Ваша музыка в цифрах. ':'Ваша музыкальная коллекция. '}<span className="artist-name">patekharmonie</span></p>
      </div>
    </header>

    {tab==='dashboard' && (
      <div className="stats-grid">
        {stats.map(({label,value,icon:Icon,caption}) => (
          <article className="stat-card" key={label}>
            <div className="stat-icon"><Icon size={19} strokeWidth={1.6}/></div>
            <h2 className="stat-label">{label}</h2>
            <div className="stat-value">{value}</div>
            <div className="stat-bottom"><ArrowUpRight size={13}/>{caption}</div>
          </article>
        ))}
      </div>
    )}

    <section className="tracks-section" aria-labelledby="tracks-heading">
     <div className="table-toolbar">
      <div className="table-title">
        <h2 id="tracks-heading">{tab==='dashboard'?'Статистика треков':'Все треки'}</h2>
        <span className="count-badge">{tracks.length}</span>
      </div>
      <div className="table-controls">
        <label className="search-field">
          <Search size={15}/>
          <input aria-label="Поиск треков" placeholder="Найти трек…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </label>
        <select className="genre-select" aria-label="Фильтр по жанру" value={genre} onChange={e=>setGenre(e.target.value)}>
          <option value="all">Все жанры</option>
          {Array.from(new Set(tracks.map(t=>t.style))).map(g=><option key={g}>{g}</option>)}
        </select>
      </div>
     </div>

     <div className="table-scroll">
      <table>
       <thead>
        <tr>
         <th>Название</th>
         <th>Жанр</th>
         <th className="numeric"><Button variant="ghost" className="sort-button" onClick={()=>changeSort('plays')}>Прослушивания<ArrowDownUp/></Button></th>
         <th className="numeric"><Button variant="ghost" className="sort-button" onClick={()=>changeSort('downloads')}>Скачивания<ArrowDownUp/></Button></th>
         <th className="numeric"><Button variant="ghost" className="sort-button" onClick={()=>changeSort('rating')}>Рейтинг<ArrowDownUp/></Button></th>
         <th className="numeric">Конверсия</th>
         <th className="numeric"><Download size={15} className="mx-auto" aria-label="Скачать"/></th>
        </tr>
       </thead>
       <tbody>
        {filtered.map(t => {
          const trackConversion = t.plays > 0 ? ((t.downloads / t.plays) * 100).toFixed(1) : '0';
          return (
            <tr key={t.id}>
             <td>
              <div className="track-cell">
               <img src={cover} className="cover" width={44} height={44} loading="lazy" alt={`Обложка ${t.title}`}/>
               <div>
                <div className="track-name">
                  {t.title}
                  {t.is_locked && <LockKeyhole size={12} className="text-muted-foreground ml-1.5 inline" aria-label="Трек заблокирован"/>}
                </div>
                <div className="track-detail">patekharmonie</div>
               </div>
              </div>
             </td>
             <td><span className="genre-tag">{t.style}</span></td>
             <td className="numeric">{t.plays}</td>
             <td className="numeric">{t.is_locked ? '—' : t.downloads}</td>
             <td className="numeric">
              <span className="rating">
                <Star size={12}/>
                {t.is_locked ? '—' : Number(t.rating).toFixed(1)}
              </span>
             </td>
             <td className="numeric">{t.is_locked ? 'Эксклюзив' : `${trackConversion}%`}</td>
             <td className="numeric">
              <Button variant="ghost" size="icon" className="download-button" disabled={t.is_locked}>
                {t.is_locked ? <LockKeyhole/> : <Download/>}
              </Button>
             </td>
            </tr>
          );
        })}
       </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-state"><AudioLines size={28} className="mx-auto mb-3"/>Треки не найдены</div>}
     </div>
     <div className="table-footer">
      <span>Показано {filtered.length} из {tracks.length} треков</span>
      <span className="lock-note"><LockKeyhole size={12}/>Заблокированные треки недоступны для скачивания</span>
     </div>
    </section>

    {notice && <p className="notice" role="status">{notice}</p>}
    <footer className="page-footer"><span>© 2026 MusicStat</span><span>Каждый трек имеет значение.</span></footer>
   </main>
  </div>
 );
}

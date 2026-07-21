'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import RegisterModal from '@/components/RegisterModal';
import ListingForm from '@/components/ListingForm';
import MarketplaceFeed from '@/components/MarketplaceFeed';
import AnonymousChat from '@/components/AnonymousChat';
import ModerationPanel from '@/components/ModerationPanel';
import MyChatsList from '@/components/MyChatsList';
import ReviewModal from '@/components/ReviewModal';
import DisputeModal from '@/components/DisputeModal';
import UserProfileStats from '@/components/UserProfileStats';



export default function Home() {
  // Стейты для проверки профиля и регистрации


  // Получаем реальные данные строго из Telegram WebApp


  const webAppUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  const [telegramUser, setTelegramUser] = useState(() => {
    if (webAppUser?.id) {
      return {
        id: String(webAppUser.id),
        username: webAppUser.username || 'user_' + webAppUser.id
      };
    }
    return {
      id: 'guest',
      username: 'guest'
    };
  });
const ADMIN_TELEGRAM_ID = '655880531'; // Твой реальный ID
// Принудительная проверка или открытие модалки для теста
  useEffect(() => {
    async function checkUserProfile() {
      // Если ты на ПК и хочешь протестировать модалку — убираем проверку на гостя
      const targetId = telegramUser.id === 'guest' ? 'test_user_id' : telegramUser.id;

      const { data } = await supabase
        .from('users')
        .select('game_id')
        .eq('telegram_id', String(targetId))
        .single();

      if (data && data.game_id) {
        setGameId(data.game_id);
        setShowRegModal(false);
      } else {
        // Принудительно открываем окно регистрации
        setShowRegModal(true);
      }
      setCheckingProfile(false);
    }

    checkUserProfile();
  }, [telegramUser.id]);
  // Стейты
  const [gameId, setGameId] = useState<string>('');
  const [inputGameId, setInputGameId] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [showRegModal, setShowRegModal] = useState<boolean>(false);

  const [listings, setListings] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [disputedChats, setDisputedChats] = useState<any[]>([]);
  const [myChats, setMyChats] = useState<any[]>([]);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingReviewChat, setPendingReviewChat] = useState<any>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'moderation' | 'chat' | 'profile'>('feed');

  const [activeChat, setActiveChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [checkingProfile, setCheckingProfile] = useState<boolean>(true);

  // Проверка прав администратора в консоли
  const isAdmin = String(telegramUser.id) === ADMIN_TELEGRAM_ID;
  console.log('Current User ID:', telegramUser.id, 'Is Admin:', isAdmin);

  // Проверка привязки игрового ID в Supabase при старте
  useEffect(() => {
    async function fetchUserProfile() {
      if (!telegramUser.id || telegramUser.id === 'guest') {
        setCheckingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('game_id')
        .eq('telegram_id', String(telegramUser.id))
        .single();

      if (data && data.game_id) {
        setGameId(data.game_id);
        setShowRegModal(false);
      } else {
        // Если профиля нет в базе — показываем модальное окно регистрации
        setShowRegModal(true);
      }
      setCheckingProfile(false);
    }

    fetchUserProfile();
  }, [telegramUser.id]);

  const checkStuckDeals = async () => {
    // Вычисляем время 60 минут назад
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Ищем активные чаты, созданные более часа назад
    const { data: stuckChats, error } = await supabase
      .from('marketplace_chats')
      .select('id, listing_id, created_at')
      .eq('status', 'active')
      .lt('created_at', oneHourAgo);

    if (error || !stuckChats || stuckChats.length === 0) return;

    for (const chat of stuckChats) {
      // Закрываем зависший чат
      await supabase
        .from('marketplace_chats')
        .update({ status: 'closed' })
        .eq('id', chat.id);

      // Возвращаем связанное объявление в активный статус
      if (chat.listing_id) {
        await supabase
          .from('marketplace_listings')
          .update({ status: 'active' })
          .eq('id', chat.listing_id);
      }
    }

    if (stuckChats.length > 0) {
      fetchAllListings();
      fetchDisputedChats();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  useEffect(() => {
    const checkUserRegistration = async () => {
      if (!telegramUser.id) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (data) {
        if (data.is_banned) {
          alert('Ваш аккаунт заблокирован администрацией!');
          return;
        }

        setGameId(data.game_id);
        setIsRegistered(true);
        setShowRegModal(false);
      } else {
        setShowRegModal(true);
      }
    };

    checkUserRegistration();
    fetchAllListings();
    fetchDisputedChats();
  }, [telegramUser.id]);

useEffect(() => {
    const initApp = async () => {
      if (!telegramUser.id) return;

      // Проверяем зависшие сделки при старте
      await checkStuckDeals();

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (data) {
        if (data.is_banned) {
          alert('Ваш аккаунт заблокирован администрацией!');
          return;
        }

        setGameId(data.game_id);
        setIsRegistered(true);
        setShowRegModal(false);
      } else {
        setShowRegModal(true);
      }
    };

    initApp();
    fetchAllListings();
    fetchDisputedChats();
  }, [telegramUser.id]);

  const fetchAllListings = async () => {
    const { data: activeData } = await supabase
      .from('marketplace_listings')
      .select('*')
      .in('status', ['active', 'reserved'])
      .order('created_at', { ascending: false });

    if (activeData) setListings(activeData);

    const { data: pendingData } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingData) setPendingListings(pendingData);
  };

  const fetchDisputedChats = async () => {
    const { data } = await supabase
      .from('marketplace_chats')
      .select('*, listing:marketplace_listings(*)')
      .eq('status', 'dispute');

    if (data) setDisputedChats(data);
  };

  const fetchMyChats = async () => {
    if (!telegramUser.id) return;

    const { data } = await supabase
      .from('marketplace_chats')
      .select('*, listing:marketplace_listings(*)')
      .or(`seller_id.eq.${telegramUser.id},buyer_id.eq.${telegramUser.id}`)
      .eq('status', 'active');

    if (data) {
      setMyChats(data);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputGameId.trim()) return;

  const { error } = await supabase.from('users').upsert([
    {
      telegram_id: String(telegramUser.id),
      username: telegramUser.username,
      game_id: inputGameId.trim(),
      is_banned: false,
      is_shadowbanned: false
    }
  ], { onConflict: 'telegram_id' });

  if (!error) {
    setGameId(inputGameId.trim());
    setIsRegistered(true);
    setShowRegModal(false);
  } else {
    alert(`Ошибка регистрации: ${error.message}`);
  }
};

  const handleCreateListing = async (formData: any) => {
    if (!isRegistered) {
      setShowRegModal(true);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_banned, is_shadowbanned')
      .eq('telegram_id', String(telegramUser.id))
      .single();

    if (userData?.is_banned) {
      alert('Ваш аккаунт заблокирован администрацией!');
      return;
    }

    const listingStatus = userData?.is_shadowbanned ? 'rejected' : 'pending';

    const { error } = await supabase.from('marketplace_listings').insert([
      {
        type: formData.type,
        title: formData.title,
        price: formData.price ? Number(formData.price) : null,
        power: formData.power || null,
        car_type: formData.carType,
        exchange_terms: formData.exchangeTerms || null,
        image_exterior: formData.image_exterior,
        image_specs: formData.image_specs,
        telegram_id: String(telegramUser.id),
        username: telegramUser.username,
        game_id: gameId,
        status: listingStatus
      }
    ]);

    if (!error) {
      fetchAllListings();
      setActiveTab('feed');
      alert('Объявление отправлено на модерацию!');
    } else {
      alert(`Ошибка: ${error.message}`);
    }
  };

  const handleModerationAction = async (listingId: number, newStatus: 'active' | 'rejected') => {
    await supabase.from('marketplace_listings').update({ status: newStatus }).eq('id', listingId);
    fetchAllListings();
  };

  const handleRespond = async (listing: any) => {
    if (!isRegistered) {
      setShowRegModal(true);
      return;
    }

    if (listing.telegram_id === String(telegramUser.id)) {
      alert('Нельзя откликаться на собственное объявление!');
      return;
    }

    let { data: existingChat } = await supabase
      .from('marketplace_chats')
      .select('*, listing:marketplace_listings(*)')
      .eq('listing_id', listing.id)
      .single();

    if (!existingChat) {
      const { data: newChat, error } = await supabase
        .from('marketplace_chats')
        .insert([
          {
            listing_id: listing.id,
            seller_id: listing.telegram_id,
            buyer_id: String(telegramUser.id),
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) {
        alert('Ошибка создания чата');
        return;
      }
      
      existingChat = { ...newChat, listing };

      await supabase.from('marketplace_listings').update({ status: 'reserved' }).eq('id', listing.id);
      fetchAllListings();
    }

    setActiveChat(existingChat);
    loadChatMessages(existingChat.id);
    setActiveTab('chat');
  };

  const loadChatMessages = async (chatId: number) => {
    const { data } = await supabase
      .from('marketplace_chat_logs')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) setChatMessages(data);
  };

  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text', mediaUrl: string | null = null) => {
    if (!activeChat) return;

    const role = activeChat.seller_id === String(telegramUser.id) ? 'seller' : 'buyer';

    const { error } = await supabase.from('marketplace_chat_logs').insert([
      {
        chat_id: activeChat.id,
        sender_telegram_id: String(telegramUser.id),
        sender_role: role,
        message_type: type,
        content: content,
        media_url: mediaUrl
      }
    ]);

    if (!error) {
      loadChatMessages(activeChat.id);
    }
  };

  const handleCloseChat = async (newListingStatus: 'completed' | 'active') => {
    if (!activeChat) return;

    if (newListingStatus === 'completed') {
      if (!confirm('Подтверждаете успешное завершение сделки?')) return;

      await supabase
        .from('marketplace_chats')
        .update({ status: 'closed' })
        .eq('id', activeChat.id);

      await supabase
        .from('marketplace_listings')
        .update({ status: 'completed' })
        .eq('id', activeChat.listing.id);

      setPendingReviewChat(activeChat);
      setShowReviewModal(true);
    } else {
      if (!confirm('Отменить сделку и вернуть объявление в ленту?')) return;

      await supabase
        .from('marketplace_chats')
        .update({ status: 'closed' })
        .eq('id', activeChat.id);

      await supabase
        .from('marketplace_listings')
        .update({ status: 'active' })
        .eq('id', activeChat.listing.id);

      alert('Сделка отменена, объявление снова в ленте.');
      setActiveChat(null);
      setActiveTab('feed');
      fetchAllListings();
      fetchDisputedChats();
    }
  };

  const handleSendReview = async (rating: number, comment: string) => {
    if (!pendingReviewChat) return;

    const targetId = String(pendingReviewChat.seller_id) === String(telegramUser.id) 
      ? pendingReviewChat.buyer_id 
      : pendingReviewChat.seller_id;

    await supabase.from('marketplace_reviews').insert([
      {
        chat_id: pendingReviewChat.id,
        target_telegram_id: String(targetId),
        author_telegram_id: String(telegramUser.id),
        rating,
        comment
      }
    ]);

    setShowReviewModal(false);
    setPendingReviewChat(null);
    alert('Спасибо за отзыв!');
    
    setActiveChat(null);
    setActiveTab('feed');
    fetchAllListings();
    fetchDisputedChats();
  };

  const handleOpenDispute = async (reason: string, files: FileList | null) => {
    if (!activeChat) return;

    let evidenceUrls: string[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `dispute_${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `disputes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            evidenceUrls.push(publicData.publicUrl);
          }
        }
      }
    }

    const { error } = await supabase
      .from('marketplace_chats')
      .update({ status: 'dispute' })
      .eq('id', activeChat.id);

    await supabase.from('marketplace_disputes').insert([
      {
        deal_id: activeChat.id,
        opened_by: String(telegramUser.id),
        reason: reason,
        evidence: evidenceUrls,
        status: 'pending'
      }
    ]);

    if (!error) {
      alert('Спор успешно открыт и передан администратору!');
      setShowDisputeModal(false);
      setActiveChat(null);
      setActiveTab('feed');
      fetchDisputedChats();
    } else {
      alert(`Ошибка: ${error.message}`);
    }
  };

  const handleResolveDispute = async (chatId: number, winnerRole: 'seller' | 'buyer', sanctionType: string) => {
    const chat = disputedChats.find((c) => c.id === chatId);
    if (!chat) return;

    const loserId = winnerRole === 'seller' ? chat.buyer_id : chat.seller_id;

    const { data: pastSanctions } = await supabase
      .from('marketplace_sanctions')
      .select('*')
      .eq('user_id', loserId);

    const count = pastSanctions ? pastSanctions.length : 0;
    
    let actualSanction = 'warning';
    let isBanned = false;
    if (count === 1) actualSanction = 'ban_7_days';
    if (count === 2) actualSanction = 'ban_30_days';
    if (count >= 3) {
      actualSanction = 'ban_perm';
      isBanned = true;
    }

    await supabase.from('marketplace_sanctions').insert([
      {
        user_id: loserId,
        type: actualSanction,
        reason: `Проигранный спор по сделке #${chatId}`,
        issued_by: String(telegramUser.id)
      }
    ]);

    if (isBanned || actualSanction.includes('ban')) {
      await supabase
        .from('users')
        .update({ is_banned: true })
        .eq('telegram_id', loserId);
    }

    await supabase.from('marketplace_chats').update({ status: 'closed' }).eq('id', chatId);
    await supabase.from('marketplace_disputes').update({ status: 'resolved', winner: winnerRole }).eq('deal_id', chatId);
    
    const newListingStatus = winnerRole === 'seller' ? 'completed' : 'active';
    await supabase.from('marketplace_listings').update({ status: newListingStatus }).eq('id', chat.listing_id);

    alert(`Спор успешно разрешен! Нарушителю применена санкция: ${actualSanction}`);
    fetchDisputedChats();
    fetchAllListings();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 max-w-md mx-auto relative font-sans pb-16">
      <header className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
        <div>
          <h1 className="font-bold text-sm text-yellow-400">CPM Marketplace</h1>
          <p className="text-[11px] text-gray-400">@{telegramUser.username}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-3 py-1 rounded-xl text-xs">
          <span className="text-gray-400">ID: </span>
          <span className="font-mono text-yellow-400">{gameId || 'Не указан'}</span>
        </div>
      </header>

      <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 mb-4 text-xs">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            activeTab === 'feed' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          🛒 Лента
        </button>

        <button
          onClick={() => {
            fetchMyChats();
            setActiveTab('chats');
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            activeTab === 'chats' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          💬 Сделки
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            activeTab === 'profile' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          👤 Профиль
        </button>

        {(String(telegramUser.id) === ADMIN_TELEGRAM_ID || Number(telegramUser.id) === Number(ADMIN_TELEGRAM_ID)) && (
  <button
    onClick={() => {
      fetchDisputedChats();
      setActiveTab('moderation');
    }}
    className={`flex-1 py-2 rounded-lg font-medium transition relative ${
      activeTab === 'moderation' ? 'bg-yellow-400 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
    }`}
  >
    🛡 Модер
    {(pendingListings.length > 0 || disputedChats.length > 0) && (
      <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
        {pendingListings.length + disputedChats.length}
      </span>
    )}
  </button>
)}
      </div>

      {activeTab === 'feed' ? (
        <>
          <ListingForm 
            onSubmit={handleCreateListing} 
            onCancel={() => setActiveTab('feed')} 
          />
          <MarketplaceFeed listings={listings} onRespond={handleRespond} />
        </>
      ) : activeTab === 'chats' ? (
        <MyChatsList
          chats={myChats}
          onOpenChat={(chat) => {
            setActiveChat(chat);
            loadChatMessages(chat.id);
            setActiveTab('chat');
          }}
        />
      ) : activeTab === 'profile' ? (
        <UserProfileStats telegramId={telegramUser.id} gameId={gameId} />
      ) : activeTab === 'chat' && activeChat ? (
        <AnonymousChat
          activeChat={activeChat}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          telegramUserId={telegramUser.id}
          onSendMessage={handleSendMessage}
          onCloseChat={handleCloseChat}
          onOpenDispute={() => setShowDisputeModal(true)}
        />
      ) : (
        <ModerationPanel 
          pendingListings={pendingListings} 
          disputedChats={disputedChats}
          onAction={handleModerationAction} 
          onOpenChat={(chat) => {
            setActiveChat(chat);
            loadChatMessages(chat.id);
            setActiveTab('chat');
          }}
          onResolveDispute={handleResolveDispute}
        />
      )}

      {showRegModal && telegramUser.id !== 'guest' && (
  <RegisterModal 
    telegramUser={telegramUser} 
    onRegistered={(newGameId) => {
      setGameId(newGameId);
      setShowRegModal(false);
    }} 
  />
)}

      <ReviewModal
        show={showReviewModal}
        onSubmit={handleSendReview}
        onClose={() => {
          setShowReviewModal(false);
          setPendingReviewChat(null);
          setActiveChat(null);
          setActiveTab('feed');
          fetchAllListings();
          fetchDisputedChats();
        }}
      />

      <DisputeModal
        show={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        onSubmit={handleOpenDispute}
      />
     {showRegModal && (
        <RegisterModal 
          telegramUser={telegramUser} 
          onRegistered={(newGameId) => {
            setGameId(newGameId);
            setShowRegModal(false);
          }} 
        />
      )}
    </main>
  );
}
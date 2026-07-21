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

export default function Home() {
  const webAppUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  
  const [telegramUser] = useState({ 
    id: webAppUser?.id || 0, 
    username: webAppUser?.username || 'guest' 
  });

  const [gameId, setGameId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [inputGameId, setInputGameId] = useState('');
  
  const [listings, setListings] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [disputedChats, setDisputedChats] = useState<any[]>([]);
  const [myChats, setMyChats] = useState<any[]>([]);
  
  // Состояния для модалки отзывов
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingReviewChat, setPendingReviewChat] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'moderation' | 'chat'>('feed');

  const [activeChat, setActiveChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

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
        setGameId(data.game_id);
        setIsRegistered(true);
      } else {
        setShowRegModal(true);
      }
    };

    checkUserRegistration();
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
    if (!inputGameId) return;

    const { error } = await supabase.from('users').insert([
      { 
        telegram_id: String(telegramUser.id), 
        username: telegramUser.username, 
        game_id: inputGameId 
      }
    ]);

    if (!error) {
      setGameId(inputGameId);
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

    // Проверяем статус бана пользователя
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
        telegram_id: String(telegramUser.id),
        username: telegramUser.username,
        game_id: gameId,
        status: listingStatus
      }
    ]);

    if (!error) {
      fetchAllListings();
      alert(userData?.is_shadowbanned ? 'Объявление отправлено на модерацию!' : 'Объявление отправлено на модерацию!');
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

  const handleOpenDispute = async () => {
    if (!activeChat) return;
    if (!confirm('Вы уверены, что хотите позвать администратора? Чат будет передан на рассмотрение модераторам.')) return;

    await supabase
      .from('marketplace_chats')
      .update({ status: 'dispute' })
      .eq('id', activeChat.id);

    alert('Администратор вызван! Ожидайте подключения.');
    setActiveChat(null);
    setActiveTab('feed');
    fetchDisputedChats();
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
      </div>

      {activeTab === 'feed' ? (
        <>
          <ListingForm onSubmit={handleCreateListing} />
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
      ) : activeTab === 'chat' && activeChat ? (
        <AnonymousChat
          activeChat={activeChat}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          telegramUserId={telegramUser.id}
          onSendMessage={handleSendMessage}
          onCloseChat={handleCloseChat}
          onOpenDispute={handleOpenDispute}
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
        />
      )}

      {/* Модальное окно регистрации Game ID */}
      <RegisterModal 
        show={showRegModal}
        onSubmit={handleRegister}
        inputGameId={inputGameId}
        setInputGameId={setInputGameId}
      />

      {/* Модальное окно оценки сделки и отзывов */}
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
    </main>
  );
}
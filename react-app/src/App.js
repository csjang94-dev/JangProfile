import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
    // ==========================================
    // 1️⃣ 상태(State) 관리 - 모든 게임 데이터
    // ==========================================
    
    // 플레이어 정보 (동적으로 변경되는 데이터)
    const [player, setPlayer] = useState({
        name: '모험자',
        level: 1,
        class: '전사',
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        exp: 0,
        maxExp: 100,
        gold: 100,
        attack: 10,
        defense: 5,
        magic: 3,
        agility: 7
    });

    // 현재 위치
    const [currentLocation, setCurrentLocation] = useState('시작마을');
    
    // 게임 메시지들
    const [messages, setMessages] = useState([
        { type: 'system', text: '=== 게임에 오신 것을 환영합니다! ===' },
        { type: 'normal', text: '당신은 시작 마을의 중앙 광장에 서 있습니다.' },
        { type: 'normal', text: '주변에는 상점, 여관, 그리고 마을 사람들이 보입니다.' },
        { type: 'system', text: '무엇을 하시겠습니까? (도움말을 입력하면 명령어 목록을 볼 수 있습니다)' },
    ]);
    
    // 입력 관련
    const [commandInput, setCommandInput] = useState('');
    
    // 인벤토리 관련
    const [activeTab, setActiveTab] = useState('items');
    const [inventory, setInventory] = useState({
        items: [
            { id: 1, name: '체력 포션', quantity: 5, icon: '🧪' },
            { id: 2, name: '마나 포션', quantity: 3, icon: '💊' },
            { id: 3, name: '빵', quantity: 10, icon: '🍞' },
        ],
        equipment: [
            { id: 4, name: '낡은 검', equipped: true, icon: '🗡️' },
            { id: 5, name: '가죽 방패', equipped: false, icon: '🛡️' },
            { id: 6, name: '천 갑옷', equipped: false, icon: '👕' },
        ],
        skills: [
            { id: 7, name: '기본 공격', icon: '⚔️', mpCost: 0 },
            { id: 8, name: '강타', icon: '💪', mpCost: 5 },
            { id: 9, name: '회전 베기', icon: '🌀', mpCost: 10 },
        ]
    });
    
    // 전투 관련
    const [isCombatActive, setIsCombatActive] = useState(false);
    const [currentEnemy, setCurrentEnemy] = useState(null);

    // 위치 데이터 (맵 정보)
    const locations = {
        '시작마을': {
            description: '평화로운 마을의 중앙 광장입니다.',
            exits: { 북: '상점가', 동: '숲입구', 남: '여관' },
            enemies: []
        },
        '상점가': {
            description: '활기찬 상점들이 늘어선 거리입니다.',
            exits: { 남: '시작마을' },
            enemies: []
        },
        '숲입구': {
            description: '어두운 숲의 입구입니다. 위험한 기운이 느껴집니다.',
            exits: { 서: '시작마을', 동: '깊은숲' },
            enemies: ['슬라임', '고블린']
        },
        '깊은숲': {
            description: '빛이 거의 들지 않는 깊은 숲입니다.',
            exits: { 서: '숲입구' },
            enemies: ['늑대', '오크']
        },
        '여관': {
            description: '따뜻하고 아늑한 여관입니다.',
            exits: { 북: '시작마을' },
            enemies: []
        }
    };

    // ==========================================
    // 2️⃣ Refs (DOM 참조)
    // ==========================================
    const gameOutputRef = useRef(null);
    const commandInputRef = useRef(null);

    // ==========================================
    // 3️⃣ Effects (부수 효과)
    // ==========================================
    
    // 메시지가 추가될 때마다 자동 스크롤
    useEffect(() => {
        if (gameOutputRef.current) {
            gameOutputRef.current.scrollTop = gameOutputRef.current.scrollHeight;
        }
    }, [messages]);

    // 위치가 변경될 때 설명 표시
    useEffect(() => {
        const location = locations[currentLocation];
        if (location) {
            addMessage(`📍 ${currentLocation}: ${location.description}`, 'system');
            if (Object.keys(location.exits).length > 0) {
                addMessage(`갈 수 있는 방향: ${Object.keys(location.exits).join(', ')}`, 'normal');
            }
        }
    }, [currentLocation]);

    // ==========================================
    // 4️⃣ 게임 로직 함수들 (JavaScript 부분)
    // ==========================================
    
    // 메시지 추가 함수
    const addMessage = (text, type = 'normal') => {
        setMessages(prevMessages => [...prevMessages, { text, type }]);
    };

    // 명령 제출 처리
    const handleSubmitCommand = () => {
        const command = commandInput.trim();
        if (!command) return;

        addMessage(`> ${command}`, 'player-action');
        executeCommand(command);
        
        setCommandInput('');
        if (commandInputRef.current) {
            commandInputRef.current.focus();
        }
    };

    // 명령어 실행
    const executeCommand = (command) => {
        const cmd = command.toLowerCase();
        
        // 이동 명령어 처리
        if (cmd === '북' || cmd === '남' || cmd === '동' || cmd === '서' || 
            cmd === '북쪽' || cmd === '남쪽' || cmd === '동쪽' || cmd === '서쪽') {
            const direction = cmd.charAt(0).toUpperCase() + cmd.slice(1).replace('쪽', '');
            movePlayer(direction);
            return;
        }

        // 일반 명령어 처리
        switch(cmd) {
            case '도움말':
                showHelp();
                break;
            case '상태':
                showPlayerStatus();
                break;
            case '인벤토리':
                showInventory();
                break;
            case '탐험':
                explore();
                break;
            case '전투':
                startCombat();
                break;
            case '휴식':
                rest();
                break;
            case '저장':
                saveGame();
                break;
            case '불러오기':
                loadGame();
                break;
            case '지도':
                showMap();
                break;
            default:
                addMessage('알 수 없는 명령어입니다. "도움말"을 입력해보세요.', 'system');
        }
    };

    // 도움말 표시
    const showHelp = () => {
        addMessage('=== 명령어 목록 ===', 'system');
        addMessage('이동: 북, 남, 동, 서 (또는 북쪽, 남쪽, 동쪽, 서쪽)', 'system');
        addMessage('행동: 탐험, 전투, 휴식', 'system');
        addMessage('정보: 상태, 인벤토리, 지도', 'system');
        addMessage('기타: 저장, 불러오기', 'system');
    };

    // 플레이어 상태 표시
    const showPlayerStatus = () => {
        addMessage('=== 플레이어 상태 ===', 'system');
        addMessage(`이름: ${player.name} | 레벨: ${player.level} | 직업: ${player.class}`, 'normal');
        addMessage(`HP: ${player.hp}/${player.maxHp} | MP: ${player.mp}/${player.maxMp}`, 'normal');
        addMessage(`경험치: ${player.exp}/${player.maxExp}`, 'normal');
        addMessage(`공격력: ${player.attack} | 방어력: ${player.defense} | 마력: ${player.magic} | 민첩: ${player.agility}`, 'normal');
        addMessage(`골드: ${player.gold}G`, 'normal');
    };

    // 인벤토리 표시
    const showInventory = () => {
        addMessage('=== 인벤토리 ===', 'system');
        inventory.items.forEach(item => {
            addMessage(`${item.icon} ${item.name} x${item.quantity}`, 'normal');
        });
    };

    // 이동
    const movePlayer = (direction) => {
        const currentLoc = locations[currentLocation];
        if (currentLoc.exits[direction]) {
            setCurrentLocation(currentLoc.exits[direction]);
            addMessage(`${direction} 방향으로 이동했습니다.`, 'normal');
        } else {
            addMessage('그 방향으로는 갈 수 없습니다.', 'system');
        }
    };

    // 탐험
    const explore = () => {
        const location = locations[currentLocation];
        const rand = Math.random();
        
        if (location.enemies && location.enemies.length > 0 && rand < 0.5) {
            startCombat();
        } else if (rand < 0.7) {
            addMessage('주변을 탐험했지만 특별한 것을 발견하지 못했습니다.', 'normal');
        } else {
            findItem();
        }
    };

    // 아이템 발견
    const findItem = () => {
        const items = ['체력 포션', '마나 포션', '빵', '동전 주머니'];
        const foundItem = items[Math.floor(Math.random() * items.length)];
        
        if (foundItem === '동전 주머니') {
            const gold = Math.floor(Math.random() * 20) + 5;
            setPlayer(prev => ({ ...prev, gold: prev.gold + gold }));
            addMessage(`💰 ${gold} 골드를 발견했습니다!`, 'reward');
        } else {
            addMessage(`📦 ${foundItem}을(를) 발견했습니다!`, 'reward');
            // 실제로 인벤토리에 추가하는 로직 필요
        }
    };

    // 전투 시작
    const startCombat = () => {
        const location = locations[currentLocation];
        if (!location.enemies || location.enemies.length === 0) {
            addMessage('이 지역에는 적이 없습니다.', 'system');
            return;
        }
        
        const enemyName = location.enemies[Math.floor(Math.random() * location.enemies.length)];
        const enemyStats = {
            '슬라임': { hp: 30, maxHp: 30, attack: 5, defense: 1 },
            '고블린': { hp: 50, maxHp: 50, attack: 8, defense: 3 },
            '늑대': { hp: 80, maxHp: 80, attack: 12, defense: 5 },
            '오크': { hp: 120, maxHp: 120, attack: 15, defense: 7 }
        };
        
        const enemy = { name: enemyName, ...enemyStats[enemyName] };
        setCurrentEnemy(enemy);
        setIsCombatActive(true);
        addMessage(`⚔️ 야생의 ${enemyName}이(가) 나타났다!`, 'combat');
    };

    // 휴식
    const rest = () => {
        if (currentLocation === '여관') {
            setPlayer(prev => ({
                ...prev,
                hp: prev.maxHp,
                mp: prev.maxMp
            }));
            addMessage('🏨 여관에서 충분히 휴식을 취했습니다. HP와 MP가 모두 회복되었습니다!', 'reward');
        } else {
            const hpRecovered = Math.floor(player.maxHp * 0.3);
            const mpRecovered = Math.floor(player.maxMp * 0.3);
            setPlayer(prev => ({
                ...prev,
                hp: Math.min(prev.hp + hpRecovered, prev.maxHp),
                mp: Math.min(prev.mp + mpRecovered, prev.maxMp)
            }));
            addMessage(`🏕️ 잠시 휴식을 취했습니다. HP +${hpRecovered}, MP +${mpRecovered}`, 'reward');
        }
    };

    // 지도 표시
    const showMap = () => {
        addMessage('=== 세계 지도 ===', 'system');
        addMessage('    [상점가]', 'normal');
        addMessage('        |', 'normal');
        addMessage('[숲입구]-[시작마을]-[여관]', 'normal');
        addMessage('    |', 'normal');
        addMessage('[깊은숲]', 'normal');
        addMessage(`현재 위치: ${currentLocation}`, 'system');
    };

    // 전투 액션
    const combatAttack = () => {
        if (!currentEnemy) return;
        
        const damage = Math.max(1, player.attack - currentEnemy.defense + Math.floor(Math.random() * 5));
        const newEnemyHp = Math.max(0, currentEnemy.hp - damage);
        
        addMessage(`당신의 공격! ${currentEnemy.name}에게 ${damage}의 데미지!`, 'combat');
        
        if (newEnemyHp <= 0) {
            // 승리
            const expGain = 10 + player.level * 5;
            const goldGain = Math.floor(Math.random() * 20) + 10;
            
            addMessage(`🎉 ${currentEnemy.name}을(를) 물리쳤습니다!`, 'reward');
            addMessage(`경험치 +${expGain}, 골드 +${goldGain}`, 'reward');
            
            setPlayer(prev => {
                let newExp = prev.exp + expGain;
                let newLevel = prev.level;
                let newMaxExp = prev.maxExp;
                
                // 레벨업 체크
                if (newExp >= prev.maxExp) {
                    newLevel++;
                    newExp = newExp - prev.maxExp;
                    newMaxExp = prev.maxExp + 50;
                    addMessage(`🆙 레벨업! 레벨 ${newLevel}이 되었습니다!`, 'reward');
                }
                
                return {
                    ...prev,
                    exp: newExp,
                    level: newLevel,
                    maxExp: newMaxExp,
                    gold: prev.gold + goldGain,
                    maxHp: newLevel > prev.level ? prev.maxHp + 20 : prev.maxHp,
                    maxMp: newLevel > prev.level ? prev.maxMp + 10 : prev.maxMp,
                    hp: newLevel > prev.level ? prev.maxHp + 20 : prev.hp,
                    mp: newLevel > prev.level ? prev.maxMp + 10 : prev.mp,
                    attack: newLevel > prev.level ? prev.attack + 2 : prev.attack,
                    defense: newLevel > prev.level ? prev.defense + 1 : prev.defense
                };
            });
            
            setIsCombatActive(false);
            setCurrentEnemy(null);
        } else {
            // 적 반격
            const enemyDamage = Math.max(1, currentEnemy.attack - player.defense + Math.floor(Math.random() * 3));
            addMessage(`${currentEnemy.name}의 반격! ${enemyDamage}의 데미지를 받았습니다!`, 'combat');
            
            setPlayer(prev => ({
                ...prev,
                hp: Math.max(0, prev.hp - enemyDamage)
            }));
            
            setCurrentEnemy(prev => ({ ...prev, hp: newEnemyHp }));
            
            // 패배 체크
            if (player.hp - enemyDamage <= 0) {
                addMessage('💀 당신은 쓰러졌습니다... 게임 오버', 'system');
                setIsCombatActive(false);
                // 게임 오버 처리
            }
        }
    };

    // 도망
    const combatFlee = () => {
        if (Math.random() < 0.5) {
            addMessage('🏃 전투에서 성공적으로 도망쳤습니다!', 'system');
            setIsCombatActive(false);
            setCurrentEnemy(null);
        } else {
            addMessage('도망치는데 실패했습니다!', 'combat');
            // 적 공격
            const enemyDamage = Math.max(1, currentEnemy.attack - player.defense);
            addMessage(`${currentEnemy.name}의 공격! ${enemyDamage}의 데미지!`, 'combat');
            setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - enemyDamage) }));
        }
    };

    // 저장/불러오기
    const saveGame = () => {
        const saveData = {
            player,
            currentLocation,
            inventory,
            messages: messages.slice(-20) // 최근 20개 메시지만 저장
        };
        localStorage.setItem('textRPGSave', JSON.stringify(saveData));
        addMessage('💾 게임이 저장되었습니다!', 'system');
    };

    const loadGame = () => {
        const saveData = localStorage.getItem('textRPGSave');
        if (saveData) {
            const parsed = JSON.parse(saveData);
            setPlayer(parsed.player);
            setCurrentLocation(parsed.currentLocation);
            setInventory(parsed.inventory);
            setMessages(parsed.messages);
            addMessage('📂 게임을 불러왔습니다!', 'system');
        } else {
            addMessage('저장된 게임이 없습니다.', 'system');
        }
    };

    // ==========================================
    // 5️⃣ JSX 렌더링 (HTML 부분)
    // ==========================================
    
    return (
        <div className="App">
            <div className="game-container">
                {/* 헤더 */}
                <header className="header">
                    <h1 className="game-title">⚔️ 텍스트 RPG ⚔️</h1>
                    <div className="header-buttons">
                        <button className="action-button" onClick={saveGame}>💾 저장</button>
                        <button className="action-button" onClick={loadGame}>📂 불러오기</button>
                        <button className="action-button" onClick={() => alert('🔊 소리 설정')}>🔊 소리</button>
                        <button className="action-button" onClick={() => alert('⚙️ 설정')}>⚙️ 설정</button>
                    </div>
                </header>

                {/* 왼쪽 패널 - 캐릭터 정보 (동적 데이터) */}
                <aside className="character-panel">
                    <h2 className="panel-title">캐릭터 정보</h2>
                    
                    <div className="character-info">
                        <div className="stat-item">
                            <strong>이름:</strong> <span>{player.name}</span>
                        </div>
                        <div className="stat-item">
                            <strong>레벨:</strong> <span>{player.level}</span>
                        </div>
                        <div className="stat-item">
                            <strong>직업:</strong> <span>{player.class}</span>
                        </div>
                    </div>

                    <div className="stat-bars">
                        <div className="stat-bar">
                            <div className="stat-bar-label">HP</div>
                            <div className="stat-bar-container">
                                <div 
                                    className="stat-bar-fill hp-bar" 
                                    style={{width: `${(player.hp / player.maxHp) * 100}%`}}
                                ></div>
                                <div className="stat-bar-text">{player.hp}/{player.maxHp}</div>
                            </div>
                        </div>
                        
                        <div className="stat-bar">
                            <div className="stat-bar-label">MP</div>
                            <div className="stat-bar-container">
                                <div 
                                    className="stat-bar-fill mp-bar" 
                                    style={{width: `${(player.mp / player.maxMp) * 100}%`}}
                                ></div>
                                <div className="stat-bar-text">{player.mp}/{player.maxMp}</div>
                            </div>
                        </div>
                        
                        <div className="stat-bar">
                            <div className="stat-bar-label">EXP</div>
                            <div className="stat-bar-container">
                                <div 
                                    className="stat-bar-fill exp-bar" 
                                    style={{width: `${(player.exp / player.maxExp) * 100}%`}}
                                ></div>
                                <div className="stat-bar-text">{player.exp}/{player.maxExp}</div>
                            </div>
                        </div>
                    </div>

                    <div className="character-stats">
                        <h3 style={{marginTop: '20px', marginBottom: '10px', color: '#ffd700'}}>스탯</h3>
                        <div className="stat-item">⚔️ 공격력: <span>{player.attack}</span></div>
                        <div className="stat-item">🛡️ 방어력: <span>{player.defense}</span></div>
                        <div className="stat-item">✨ 마력: <span>{player.magic}</span></div>
                        <div className="stat-item">🏃 민첩: <span>{player.agility}</span></div>
                        <div className="stat-item">💰 골드: <span>{player.gold}</span></div>
                    </div>
                </aside>

                {/* 메인 게임 영역 */}
                <main className="main-game-area">
                    <div className="location-header">
                        <div className="location-name">{currentLocation}</div>
                        <div className="location-description">
                            {locations[currentLocation]?.description}
                        </div>
                    </div>
                    
                    <div className="game-output" ref={gameOutputRef}>
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`game-message message-${msg.type}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>
                </main>

                {/* 오른쪽 패널 - 인벤토리 */}
                <aside className="inventory-panel">
                    <h2 className="panel-title">인벤토리</h2>
                    
                    <div className="inventory-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'items' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('items')}
                        >
                            아이템
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('equipment')}
                        >
                            장비
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('skills')}
                        >
                            스킬
                        </button>
                    </div>
                    
                    <div className="inventory-content">
                        {activeTab === 'items' && inventory.items.map(item => (
                            <div key={item.id} className="inventory-item">
                                {item.icon} {item.name} x{item.quantity}
                            </div>
                        ))}
                        {activeTab === 'equipment' && inventory.equipment.map(item => (
                            <div key={item.id} className="inventory-item">
                                {item.icon} {item.name} {item.equipped ? '[장착중]' : ''}
                            </div>
                        ))}
                        {activeTab === 'skills' && inventory.skills.map(skill => (
                            <div key={skill.id} className="inventory-item">
                                {skill.icon} {skill.name} (MP: {skill.mpCost})
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 하단 입력 영역 */}
                <footer className="input-area">
                    <div className="quick-actions">
                        <button className="action-button" onClick={() => executeCommand('탐험')}>🔍 탐험</button>
                        <button className="action-button" onClick={() => executeCommand('전투')}>⚔️ 전투</button>
                        <button className="action-button" onClick={() => executeCommand('휴식')}>🏕️ 휴식</button>
                        <button className="action-button" onClick={() => executeCommand('지도')}>🗺️ 지도</button>
                        <button className="action-button" onClick={() => executeCommand('상태')}>📊 상태</button>
                        <button className="action-button" onClick={() => executeCommand('인벤토리')}>🎒 가방</button>
                        <button className="action-button" onClick={() => executeCommand('도움말')}>❓ 도움말</button>
                    </div>
                    
                    <div className="command-input-container">
                        <input 
                            type="text" 
                            className="command-input" 
                            ref={commandInputRef}
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmitCommand();
                                }
                            }}
                            placeholder="명령어를 입력하세요... (예: 북, 탐험, 상태)"
                            autoFocus
                        />
                        <button className="submit-button" onClick={handleSubmitCommand}>실행</button>
                    </div>
                </footer>
            </div>

            {/* 전투 오버레이 */}
            {isCombatActive && currentEnemy && (
                <>
                    <div className="modal-backdrop" onClick={() => setIsCombatActive(false)}></div>
                    <div className="combat-overlay">
                        <div className="enemy-info">
                            <div className="enemy-name">{currentEnemy.name}</div>
                            <div className="stat-bar">
                                <div className="stat-bar-container">
                                    <div 
                                        className="stat-bar-fill hp-bar" 
                                        style={{width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`}}
                                    ></div>
                                    <div className="stat-bar-text">{currentEnemy.hp}/{currentEnemy.maxHp}</div>
                                </div>
                            </div>
                        </div>
                        <div className="combat-actions">
                            <button className="combat-button" onClick={combatAttack}>⚔️ 공격</button>
                            <button className="combat-button" onClick={() => addMessage('🛡️ 방어 태세!', 'combat')}>🛡️ 방어</button>
                            <button className="combat-button" onClick={() => addMessage('✨ MP가 부족합니다!', 'system')}>✨ 스킬</button>
                            <button className="combat-button" onClick={() => addMessage('🧪 사용할 아이템이 없습니다!', 'system')}>🧪 아이템</button>
                            <button className="combat-button" onClick={combatFlee}>🏃 도망</button>
                            <button className="combat-button" onClick={() => addMessage(`📊 ${currentEnemy.name} - 공격력: ${currentEnemy.attack}, 방어력: ${currentEnemy.defense}`, 'system')}>📊 분석</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
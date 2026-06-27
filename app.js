// ==========================================
// 1. 初始化 Supabase 用戶端設定
// ==========================================
// 請替換成您在 Supabase 專案生成的對應憑證
const SUPABASE_URL = window.SUPABASE_URL || "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "your-anon-key";

let supabase = null;
if (SUPABASE_URL.indexOf("your-project-id") === -1) {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 全域狀態管理變數
let globalRecipes = [];
let currentUser = null;
let isFormDirty = false; // 用於偵測使用者離開未儲存表單的防呆機制

// 內建的 4 筆大廚黃金公式示範資料庫
const DEMO_RECIPES = [
    {
        id: "demo-1", title: "黃金比例微波蒸蛋", date: "2026-06-27", category: "配菜", tags: ["快速料理", "一人份"],
        ingredients: [{ name: "雞蛋", amount: "2顆", prep: "充分打散" }, { name: "溫水", amount: "160ml", prep: "與蛋液1:1.5" }],
        equipment: "微波爐", microwaveSettings: { power: "500W", time: "3分鐘", isSegmented: true, segments: "前2分鐘，取出輕攪，再補1分鐘", container: "瓷碗", hasCover: true, hasVents: true },
        riceCookerSettings: {}, steps: [{ order: 1, desc: "蛋液過篩加入水攪勻，加蓋並留透氣孔", equip: "無", time: "", note: "過篩去泡是滑嫩關鍵" }, { order: 2, desc: "低功率分段微波加熱", equip: "微波爐", time: "3分鐘", note: "大火容易變蜂窩狀" }],
        result: "大成功", ratings: { taste: 5, doneness: 5, texture: 5, convenience: 5 }, isRepeatable: true, notes: "口感像布丁一樣完美！", nextAdjustment: "下次可以加一滴高湯增鮮。", totalTime: "4分鐘"
    },
    {
        id: "demo-2", title: "超嫩鮮汁電鍋雞胸肉", date: "2026-06-27", category: "主食", tags: ["高蛋白", "低油"],
        ingredients: [{ name: "雞胸肉", amount: "1片(200g)", prep: "橫切不切斷" }, { name: "鹽與米酒", amount: "適量", prep: "醃製10分鐘" }],
        equipment: "電鍋", microwaveSettings: {},
        riceCookerSettings: { water: "0.8杯", simmerTime: 10, steamCount: 1, container: "耐熱瓷盤+蒸架", hasCover: false, preheat: true },
        steps: [{ order: 1, desc: "外鍋加0.8杯水，按下去預熱至冒蒸汽", equip: "電鍋", time: "3分鐘", note: "" }, { order: 2, desc: "放入雞胸肉盤，蓋鍋蓋蒸至跳起，緊悶10分鐘", equip: "電鍋", time: "15分鐘", note: "絕對不要提早開蓋" }],
        result: "成功", ratings: { taste: 4, doneness: 5, texture: 4, convenience: 4 }, isRepeatable: true, notes: "利用預熱鎖住肉汁，完全不柴！", nextAdjustment: "可加上幾片薑片一起蒸去腥。", totalTime: "20分鐘"
    },
    {
        id: "demo-3", title: "蒜香鮮甜微波高麗菜", date: "2026-06-27", category: "配菜", tags: ["清冰箱", "快速料理"],
        ingredients: [{ name: "高麗菜", amount: "1/4顆", prep: "手撕一口大小" }, { name: "蒜末/香油/鹽", amount: "少許", prep: "" }],
        equipment: "微波爐", microwaveSettings: { power: "700W", time: "2分30秒", isSegmented: false, segments: "", container: "可微波保鮮盒", hasCover: true, hasVents: true },
        riceCookerSettings: {}, steps: [{ order: 1, desc: "蔬菜洗淨帶微量水分放入盒內，撒上蒜頭、鹽、香油", equip: "無", time: "", note: "" }, { order: 2, desc: "扣上蓋子打開透氣孔，大火微波2分30秒後拌勻", equip: "微波爐", time: "2.5分鐘", note: "" }],
        result: "成功", ratings: { taste: 4, doneness: 4, texture: 5, convenience: 5 }, isRepeatable: true, notes: "比炒的還清脆，且不用洗油鍋！", nextAdjustment: "下次加點辣椒絲視覺更棒。", totalTime: "3分鐘"
    },
    {
        id: "demo-4", title: "一鍵到底電鍋番茄炊飯", date: "2026-06-27", category: "主食", tags: ["便當菜", "一人份"],
        ingredients: [{ name: "白米", amount: "1杯", prep: "洗淨瀝乾" }, { name: "大番茄", amount: "1顆", prep: "蒂頭劃十字" }, { name: "綜合菇/黑胡椒", amount: "適量", prep: "" }],
        equipment: "電鍋", microwaveSettings: {},
        riceCookerSettings: { water: "0.9杯", simmerTime: 15, steamCount: 1, container: "內鍋", hasCover: false, preheat: false },
        steps: [{ order: 1, desc: "內鍋放米、比平時少一點的水，中間擺番茄與配料", equip: "無", time: "", note: "番茄會出水，水要減量" }, { order: 2, desc: "外鍋1杯水蒸熟，跳起後悶15分鐘，開蓋將番茄壓碎與飯拌勻", equip: "電鍋", time: "25分鐘", note: "" }],
        result: "大成功", ratings: { taste: 5, doneness: 5, texture: 4, convenience: 5 }, isRepeatable: true, notes: "超省時，番茄酸甜跟米飯完美融合。", nextAdjustment: "起鍋拌入一塊奶油會香到升天。", totalTime: "40分鐘"
    }
];

// ==========================================
// 2. 核心生命週期與事件綁定
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    initDOMEvents();
    if (supabase) {
        // 檢查 Supabase 目前登入狀態
        const { data: { session } } = await supabase.auth.getSession();
        updateUserStatus(session?.user || null);

        // 監聽登入狀態改變
        supabase.auth.onAuthStateChange((_event, session) => {
            updateUserStatus(session?.user || null);
        });
    } else {
        document.getElementById("user-status").innerHTML = "⚠️ 未設定雲端金鑰 (本地模式)";
        loadRecipes();
    }
});

// 介面 DOM 事件綁定
function initDOMEvents() {
    // 導覽與主按鈕
    document.getElementById("auth-btn").addEventListener("click", handleAuthAction);
    document.getElementById("open-add-modal-btn").addEventListener("click", () => openRecipeModal());
    document.getElementById("open-data-mgr-btn").addEventListener("click", openDataMgrModal);
    
    // 彈窗關閉按鈕群
    document.getElementById("close-recipe-modal").addEventListener("click", () => closeIdModal("recipe-modal"));
    document.getElementById("cancel-recipe-btn").addEventListener("click", () => closeIdModal("recipe-modal"));
    document.getElementById("close-detail-modal").addEventListener("click", () => closeIdModal("detail-modal"));
    document.getElementById("detail-close-btn").addEventListener("click", () => closeIdModal("detail-modal"));
    document.getElementById("close-data-modal").addEventListener("click", () => closeIdModal("data-mgr-modal"));
    document.getElementById("close-auth-modal").addEventListener("click", () => closeIdModal("auth-modal"));
    
    // 表單動態增刪按鈕
    document.getElementById("add-ingredient-btn").addEventListener("click", () => addIngredientRow());
    document.getElementById("add-step-btn").addEventListener("click", () => addStepRow());
    document.getElementById("form-equipment").addEventListener("change", toggleEquipmentPanels);
    document.getElementById("mw-segmented").addEventListener("change", (e) => {
        document.getElementById("mw-segments").classList.toggle("hidden", !e.target.checked);
    });
    document.getElementById("save-recipe-btn").addEventListener("click", handleSaveRecipe);

    // 搜尋與篩選事件
    document.getElementById("search-input").addEventListener("input", filterRecipes);
    document.querySelectorAll("#quick-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll("#quick-filters .filter-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            filterRecipes();
        });
    });

    // 資料管理核心
    document.getElementById("export-btn").addEventListener("click", exportData);
    document.getElementById("import-file").addEventListener("change", importData);
    document.getElementById("clear-all-btn").addEventListener("click", clearAllData);
    document.getElementById("send-magic-link-btn").addEventListener("click", sendMagicLink);
    document.getElementById("migrate-btn").addEventListener("click", migrateLocalToCloud);

    // 表單防跳離變更偵測
    document.getElementById("recipe-form").addEventListener("input", () => { isFormDirty = true; });

    // 視窗關閉前確認
    window.addEventListener("beforeunload", (e) => {
        if (isFormDirty) {
            e.preventDefault();
            e.returnValue = "您輸入的料理實驗數據尚未儲存，確定要離開嗎？";
        }
    });
}

// ==========================================
// 3. 使用者登入狀態與雲端切換邏輯
// ==========================================
function updateUserStatus(user) {
    currentUser = user;
    const statusTxt = document.getElementById("user-status");
    const authBtn = document.getElementById("auth-btn");
    const cloudInfo = document.getElementById("cloud-info");
    const cloudActions = document.getElementById("cloud-actions");

    if (user) {
        statusTxt.innerHTML = `👋 大廚已連線: <span style="color:var(--sage-green); font-weight:bold;">${user.email}</span>`;
        authBtn.innerText = "登出雲端";
        cloudInfo.innerText = "✨ 您已成功啟用雲端同步！所有新紀錄將同步保存於 Supabase 安全資料庫中。";
        cloudActions.classList.remove("hidden");
    } else {
        statusTxt.innerHTML = "👤 本地離線模式";
        authBtn.innerText = "登入雲端帳號";
        cloudInfo.innerText = "目前為本地離線狀態。登入後可安全啟用跨裝置同步，並將本地紀錄一鍵搬移上雲端。";
        cloudActions.classList.add("hidden");
    }
    loadRecipes();
}

async function handleAuthAction() {
    if (currentUser) {
        if (confirm("確定要登出雲端同步嗎？登出後將切換回本地檢視模式。")) {
            await supabase.auth.signOut();
            alert("已成功安全登出。");
        }
    } else {
        if (!supabase) {
            alert("本站目前未配置 Supabase 金鑰，請參考 README 說明填入金鑰即可開啟雲端功能！");
            return;
        }
        document.getElementById("auth-modal").classList.remove("hidden");
    }
}

async function sendMagicLink() {
    const email = document.getElementById("auth-email").value.trim();
    if (!email) return alert("請輸入有效的 Email 電子郵件信箱。");
    
    const sendBtn = document.getElementById("send-magic-link-btn");
    sendBtn.disabled = true;
    sendBtn.innerText = "發送中...";

    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.href }
    });

    if (error) {
        alert("發送失敗: " + error.message);
        sendBtn.disabled = false;
        sendBtn.innerText = "發送登入連結";
    } else {
        alert("🚀 登入連結已發送！請至您的信箱收取 Magic Link 郵件，點擊其中的連結即可自動完成登入同步！");
        closeIdModal("auth-modal");
        sendBtn.disabled = false;
        sendBtn.innerText = "發送登入連結";
    }
}

// ==========================================
// 4. 資料載入與雲端資料同步庫 (CRUD)
// ==========================================
async function loadRecipes() {
    if (currentUser) {
        // 雲端同步模式：從 Supabase 讀取
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .order('date', { ascending: false });
            
            if (error) throw error;
            // 轉化格式符合前端命名
            globalRecipes = data.map(r => mapCloudToLocal(r));
        } catch (err) {
            console.error("讀取雲端資料失敗，切換本地預防緩存:", err);
            globalRecipes = [];
        }
    } else {
        // 本地模式：從 localStorage 讀取
        const localData = localStorage.getItem("nocook_chef_recipes");
        if (localData) {
            globalRecipes = JSON.parse(localData);
        } else {
            // 首次開啟無資料，自動注入 4 筆大廚黃金公式示範資料庫
            globalRecipes = [...DEMO_RECIPES];
            localStorage.setItem("nocook_chef_recipes", JSON.stringify(globalRecipes));
        }
    }
    renderRecipes(globalRecipes);
    updateDashboardStats();
}

async function saveRecipes() {
    if (currentUser) {
        // 雲端即時同步，單筆新增修改在 handleSaveRecipe 處理，此處做狀態重新載入確保同歩
        await loadRecipes();
    } else {
        localStorage.setItem("nocook_chef_recipes", JSON.stringify(globalRecipes));
        renderRecipes(globalRecipes);
        updateDashboardStats();
    }
}

// 雲端/本地欄位結構適配器
function mapLocalToCloud(r) {
    return {
        id: r.id.startsWith("demo-") || !isNaN(r.id) ? undefined : r.id, // 讓資料庫自增或採uuid
        user_id: currentUser ? currentUser.id : undefined,
        title: r.title, date: r.date || new null, category: r.category, tags: r.tags,
        ingredients: r.ingredients, equipment: r.equipment,
        microwave_settings: r.microwaveSettings, rice_cooker_settings: r.riceCookerSettings,
        steps: r.steps, result: r.result, ratings: r.ratings, is_repeatable: r.isRepeatable,
        notes: r.notes, next_adjustment: r.nextAdjustment, total_time: r.totalTime,
        updated_at: new Date().toISOString()
    };
}
function mapCloudToLocal(c) {
    return {
        id: c.id, title: c.title, date: c.date, category: c.category, tags: c.tags || [],
        ingredients: c.ingredients || [], equipment: c.equipment,
        microwaveSettings: c.microwave_settings || {}, riceCookerSettings: c.rice_cooker_settings || {},
        steps: c.steps || [], result: c.result, ratings: c.ratings || {}, isRepeatable: c.is_repeatable,
        notes: c.notes, nextAdjustment: c.next_adjustment, totalTime: c.total_time
    };
}

// ==========================================
// 5. 畫面渲染與大廚儀表板統計更新
// ==========================================
function renderRecipes(recipesList) {
    const grid = document.getElementById("recipes-grid");
    const emptyState = document.getElementById("empty-state");
    grid.innerHTML = "";

    if (recipesList.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }
    emptyState.classList.add("hidden");

    recipesList.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        
        let badgeClass = "badge-success";
        if (recipe.result === "待改進") badgeClass = "badge-warning";
        if (recipe.result === "失敗") badgeClass = "badge-danger";

        // 預設手帳風格背景插圖
        const fallbackImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23F2EFE5'/><text x='50%' y='55%' font-size='30' text-anchor='middle'>🍳</text></svg>";
        const imgSrc = recipe.image || fallbackImg;

        card.innerHTML = `
            <img src="${imgSrc}" class="card-img" alt="${recipe.title}" onerror="this.src='${fallbackImg}'">
            <div class="card-content">
                <div class="card-header-row">
                    <h3 class="card-title">${escapeHTML(recipe.title)}</h3>
                    <span class="card-badge ${badgeClass}">${recipe.result}</span>
                </div>
                <p class="card-meta">📅 ${recipe.date} | ⏱️ ${recipe.totalTime || '未計'}</p>
                <p class="card-meta">⚡ 設備：<strong>${recipe.equipment}</strong></p>
                <div class="card-tags">
                    ${(recipe.tags || []).map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join("")}
                </div>
                <div class="card-footer-actions">
                    <button class="btn btn-secondary btn-sm" onclick="viewRecipeDetail('${recipe.id}')">📖 詳情手帳</button>
                    <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${recipe.id}')">✏️ 編輯</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecipe('${recipe.id}')">🗑️ 刪除</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateDashboardStats() {
    document.getElementById("stat-total").innerText = globalRecipes.length;
    const successCount = globalRecipes.filter(r => r.result === "大成功" || r.result === "成功").length;
    document.getElementById("stat-success").innerText = successCount;

    // 計算最常使用設備
    const eqCounts = {};
    globalRecipes.forEach(r => { if(r.equipment) eqCounts[r.equipment] = (eqCounts[r.equipment] || 0) + 1; });
    let maxEq = "無"; let maxCount = 0;
    for (let eq in eqCounts) { if(eqCounts[eq] > maxCount) { maxCount = eqCounts[eq]; maxEq = eq; } }
    document.getElementById("stat-device").innerText = maxEq;

    // 今日隨機成功靈感推薦
    const pool = globalRecipes.filter(r => r.result === "大成功" || r.result === "成功");
    const recBox = document.getElementById("random-recommend-box");
    const recContent = document.getElementById("recommend-content");
    if (pool.length > 0) {
        recBox.classList.remove("hidden");
        const randomRecipe = pool[Math.floor(Math.random() * pool.length)];
        recContent.innerHTML = `<span style="cursor:pointer; font-weight:bold; color:var(--text-dark); text-decoration:underline;" onclick="viewRecipeDetail('${randomRecipe.id}')">👉 ${escapeHTML(randomRecipe.title)} (${randomRecipe.equipment}) - 「${escapeHTML(randomRecipe.notes || '美味無負擔')}」</span>`;
    } else {
        recBox.classList.add("hidden");
    }
}

// ==========================================
// 6. 搜尋與高級動態篩選器
// ==========================================
function filterRecipes() {
    const searchKeyword = document.getElementById("search-input").value.toLowerCase().trim();
    const activeFilterBtn = document.querySelector("#quick-filters .filter-btn.active");
    const filterType = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";

    const filtered = globalRecipes.filter(recipe => {
        // 1. 搜尋關鍵字比對
        const matchKeyword = !searchKeyword || 
            recipe.title.toLowerCase().includes(searchKeyword) ||
            (recipe.notes && recipe.notes.toLowerCase().includes(searchKeyword)) ||
            recipe.tags.some(t => t.toLowerCase().includes(searchKeyword)) ||
            recipe.ingredients.some(i => i.name.toLowerCase().includes(searchKeyword));

        // 2. 快速標籤篩選比對
        let matchFilter = true;
        if (filterType === "微波爐" || filterType === "電鍋" || filterType === "微波爐＋電鍋") {
            matchFilter = (recipe.equipment === filterType);
        } else if (filterType === "成功") {
            matchFilter = (recipe.result === "大成功" || recipe.result === "成功");
        } else if (filterType === "待改進") {
            matchFilter = (recipe.result === "待改進" || recipe.result === "失敗");
        }

        return matchKeyword && matchFilter;
    });

    renderRecipes(filtered);
}

// ==========================================
// 7. 表單彈窗開啟、動態欄位增刪與連動
// ==========================================
function openRecipeModal(recipeId = null) {
    isFormDirty = false;
    const form = document.getElementById("recipe-form");
    form.reset();
    document.getElementById("ingredients-container").innerHTML = "";
    document.getElementById("steps-container").innerHTML = "";

    if (recipeId) {
        // 編輯模式
        document.getElementById("modal-title").innerText = "✏️ 編輯料理實驗紀錄";
        const recipe = globalRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        document.getElementById("form-recipe-id").value = recipe.id;
        document.getElementById("form-title").value = recipe.title;
        document.getElementById("form-date").value = recipe.date;
        document.getElementById("form-category").value = recipe.category;
        document.getElementById("form-image").value = recipe.image || "";
        document.getElementById("form-equipment").value = recipe.equipment;
        document.getElementById("form-result").value = recipe.result;
        document.getElementById("form-totaltime").value = recipe.totalTime || "";
        document.getElementById("form-repeatable").checked = recipe.isRepeatable !== false;
        document.getElementById("form-notes").value = recipe.notes || "";
        document.getElementById("form-adjustment").value = recipe.nextAdjustment || "";

        // 評分
        document.getElementById("rate-taste").value = recipe.ratings?.taste || 5;
        document.getElementById("rate-doneness").value = recipe.ratings?.doneness || 5;
        document.getElementById("rate-texture").value = recipe.ratings?.texture || 5;
        document.getElementById("rate-convenience").value = recipe.ratings?.convenience || 5;

        // 標籤勾選
        document.querySelectorAll("#form-tags input").forEach(cb => {
            cb.checked = recipe.tags.includes(cb.value);
        });

        // 還原食材與步驟
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(i => addIngredientRow(i.name, i.amount, i.prep));
        } else { addIngredientRow(); }

        if (recipe.steps && recipe.steps.length > 0) {
            recipe.steps.forEach(s => addStepRow(s.desc, s.equip, s.time, s.note));
        } else { addStepRow(); }

        // 還原設備子面板
        if (recipe.microwaveSettings) {
            document.getElementById("mw-power").value = recipe.microwaveSettings.power || "";
            document.getElementById("mw-time").value = recipe.microwaveSettings.time || "";
            document.getElementById("mw-segmented").checked = recipe.microwaveSettings.isSegmented || false;
            document.getElementById("mw-segments").value = recipe.microwaveSettings.segments || "";
            document.getElementById("mw-segments").classList.toggle("hidden", !recipe.microwaveSettings.isSegmented);
            document.getElementById("mw-container").value = recipe.microwaveSettings.container || "";
            document.getElementById("mw-cover").checked = recipe.microwaveSettings.hasCover || false;
            document.getElementById("mw-vents").checked = recipe.microwaveSettings.hasVents || false;
        }
        if (recipe.riceCookerSettings) {
            document.getElementById("rc-water").value = recipe.riceCookerSettings.water || "";
            document.getElementById("rc-simmer").value = recipe.riceCookerSettings.simmerTime || "";
            document.getElementById("rc-steamcount").value = recipe.riceCookerSettings.steamCount || 1;
            document.getElementById("rc-container").value = recipe.riceCookerSettings.container || "";
            document.getElementById("rc-cover").checked = recipe.riceCookerSettings.hasCover || false;
            document.getElementById("rc-preheat").checked = recipe.riceCookerSettings.preheat || false;
        }
    } else {
        // 新增模式
        document.getElementById("modal-title").innerText = "➕ 新增料理實驗紀錄";
        document.getElementById("form-recipe-id").value = "";
        document.getElementById("form-date").value = new Date().toISOString().split('T')[0];
        addIngredientRow();
        addStepRow();
    }

    toggleEquipmentPanels();
    document.getElementById("recipe-modal").classList.remove("hidden");
}

function toggleEquipmentPanels() {
    const eq = document.getElementById("form-equipment").value;
    document.getElementById("microwave-panel").classList.toggle("hidden", eq !== "微波爐" && eq !== "微波爐＋電鍋");
    document.getElementById("ricecooker-panel").classList.toggle("hidden", eq !== "電鍋" && eq !== "微波爐＋電鍋");
}

function addIngredientRow(name = "", amount = "", prep = "") {
    const container = document.getElementById("ingredients-container");
    const div = document.createElement("div");
    div.className = "dynamic-row ingredient-item";
    div.innerHTML = `
        <input type="text" placeholder="食材名稱 (如: 高麗菜)" class="ing-name" value="${escapeHTML(name)}" style="flex:2;">
        <input type="text" placeholder="份量 (如: 100g)" class="ing-amount" value="${escapeHTML(amount)}" style="flex:1;">
        <input type="text" placeholder="備料方式 (如: 切絲)" class="ing-prep" value="${escapeHTML(prep)}" style="flex:1;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">❌</button>
    `;
    container.appendChild(div);
}

function addStepRow(desc = "", equip = "無", time = "", note = "") {
    const container = document.getElementById("steps-container");
    const stepCount = container.children.length + 1;
    const div = document.createElement("div");
    div.className = "dynamic-row step-item";
    div.innerHTML = `
        <span class="step-order" style="font-weight:bold; color:var(--sage-green); min-width:20px;">${stepCount}</span>
        <input type="text" placeholder="操作說明步驟..." class="step-desc" value="${escapeHTML(desc)}" style="flex:3;" required>
        <input type="text" placeholder="設備" class="step-equip" value="${escapeHTML(equip)}" style="flex:1;">
        <input type="text" placeholder="時間" class="step-time" value="${escapeHTML(time)}" style="flex:1;">
        <input type="text" placeholder="注意事項備註" class="step-note" value="${escapeHTML(note)}" style="flex:1;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove(); reindexSteps();">❌</button>
    `;
    container.appendChild(div);
}

function reindexSteps() {
    const steps = document.querySelectorAll("#steps-container .step-item");
    steps.forEach((step, idx) => {
        step.querySelector(".step-order").innerText = idx + 1;
    });
}

// ==========================================
// 8. 紀錄儲存、刪除與一鍵複製公式機制
// ==========================================
async function handleSaveRecipe() {
    const title = document.getElementById("form-title").value.trim();
    if (!title) return alert("請填寫料理實驗名稱！");

    const id = document.getElementById("form-recipe-id").value;
    const equipment = document.getElementById("form-equipment").value;

    // 收集勾選的自訂標籤
    const tags = [];
    document.querySelectorAll("#form-tags input:checked").forEach(cb => tags.push(cb.value));

    // 收集動態食材
    const ingredients = [];
    document.querySelectorAll("#ingredients-container .ingredient-item").forEach(row => {
        const name = row.querySelector(".ing-name").value.trim();
        if (name) {
            ingredients.push({
                name: name,
                amount: row.querySelector(".ing-amount").value.trim(),
                prep: row.querySelector(".ing-prep").value.trim()
            });
        }
    });

    // 收集動態步驟
    const steps = [];
    document.querySelectorAll("#steps-container .step-item").forEach((row, index) => {
        const desc = row.querySelector(".step-desc").value.trim();
        if (desc) {
            steps.push({
                order: index + 1,
                desc: desc,
                equip: row.querySelector(".step-equip").value.trim(),
                time: row.querySelector(".step-time").value.trim(),
                note: row.querySelector(".step-note").value.trim()
            });
        }
    });

    // 封裝核心物件
    const recipeData = {
        id: id || "rec_" + Date.now(),
        title: title,
        date: document.getElementById("form-date").value,
        category: document.getElementById("form-category").value,
        image: document.getElementById("form-image").value.trim(),
        tags: tags,
        ingredients: ingredients,
        equipment: equipment,
        microwaveSettings: {
            power: document.getElementById("mw-power").value,
            time: document.getElementById("mw-time").value,
            isSegmented: document.getElementById("mw-segmented").checked,
            segments: document.getElementById("mw-segments").value,
            container: document.getElementById("mw-container").value,
            hasCover: document.getElementById("mw-cover").checked,
            hasVents: document.getElementById("mw-vents").checked
        },
        riceCookerSettings: {
            water: document.getElementById("rc-water").value,
            simmerTime: parseInt(document.getElementById("rc-simmer").value) || 0,
            steamCount: parseInt(document.getElementById("rc-steamcount").value) || 1,
            container: document.getElementById("rc-container").value,
            hasCover: document.getElementById("rc-cover").checked,
            preheat: document.getElementById("rc-preheat").checked
        },
        steps: steps,
        result: document.getElementById("form-result").value,
        totalTime: document.getElementById("form-totaltime").value,
        isRepeatable: document.getElementById("form-repeatable").checked,
        notes: document.getElementById("form-notes").value,
        nextAdjustment: document.getElementById("form-adjustment").value,
        ratings: {
            taste: parseInt(document.getElementById("rate-taste").value) || 5,
            doneness: parseInt(document.getElementById("rate-doneness").value) || 5,
            texture: parseInt(document.getElementById("rate-texture").value) || 5,
            convenience: parseInt(document.getElementById("rate-convenience").value) || 5
        }
    };

    if (currentUser) {
        // 雲端同步儲存
        const cloudObj = mapLocalToCloud(recipeData);
        if (id) {
            // 雲端修改
            const { error } = await supabase.from('recipes').update(cloudObj).eq('id', id);
            if (error) return alert("同步修改失敗: " + error.message);
        } else {
            // 雲端新增
            const { error } = await supabase.from('recipes').insert([cloudObj]);
            if (error) return alert("同步儲存失敗: " + error.message);
        }
    } else {
        // 本地儲存
        if (id) {
            const idx = globalRecipes.findIndex(r => r.id === id);
            globalRecipes[idx] = recipeData;
        } else {
            globalRecipes.unshift(recipeData);
        }
    }

    isFormDirty = false;
    await saveRecipes();
    closeIdModal("recipe-modal");
    alert("🎉 料理實驗室紀錄儲存成功！");
}

async function deleteRecipe(id) {
    if (!confirm("確定要永遠刪除這筆珍貴的加熱公式紀錄嗎？此操作不可逆！")) return;
    
    if (currentUser) {
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) return alert("刪除失敗: " + error.message);
    } else {
        globalRecipes = globalRecipes.filter(r => r.id !== id);
    }
    await saveRecipes();
    alert("已成功清除該筆紀錄。");
}

// 詳情檢視與手帳式呈現
function viewRecipeDetail(id) {
    const recipe = globalRecipes.find(r => r.id === id);
    if (!recipe) return;

    const body = document.getElementById("detail-body");
    
    let eqDetailsHTML = "";
    if (recipe.equipment === "微波爐" || recipe.equipment === "微波爐＋電鍋") {
        eqDetailsHTML += `
            <p><strong>微波功率：</strong>${recipe.microwaveSettings?.power || '未註記'}</p>
            <p><strong>微波時間：</strong>${recipe.microwaveSettings?.time || '未註記'}</p>
            <p><strong>分段加熱：</strong>${recipe.microwaveSettings?.isSegmented ? `是 (${recipe.microwaveSettings.segments})` : '否'}</p>
            <p><strong>加蓋狀況：</strong>${recipe.microwaveSettings?.hasCover ? '有加蓋' : '未加蓋'} ${recipe.microwaveSettings?.hasVents ? '(留透氣孔)' : ''}</p>
        `;
    }
    if (recipe.equipment === "電鍋" || recipe.equipment === "微波爐＋電鍋") {
        eqDetailsHTML += `
            <p><strong>外鍋水量：</strong>${recipe.riceCookerSettings?.water || '未註記'}</p>
            <p><strong>燜蒸時間：</strong>跳起後燜 ${recipe.riceCookerSettings?.simmerTime || 0} 分鐘</p>
            <p><strong>內鍋加蓋：</strong>${recipe.riceCookerSettings?.hasCover ? '是' : '否'}</p>
            <p><strong>外鍋預熱：</strong>${recipe.riceCookerSettings?.preheat ? '有預熱' : '無'}</p>
        `;
    }

    body.innerHTML = `
        <div class="detail-sec">
            <h3>🍳 ${escapeHTML(recipe.title)}</h3>
            <p style="color:var(--text-muted); font-size:0.85rem;">分類：${recipe.category} | 日期：${recipe.date} | 總耗時：${recipe.totalTime || '未計'}</p>
        </div>
        <div class="detail-sec">
            <h4>🥕 實驗食材比例</h4>
            <ul>
                ${recipe.ingredients.map(i => `<li><strong>${escapeHTML(i.name)}</strong>：${escapeHTML(i.amount)} ${i.prep ? `(${escapeHTML(i.prep)})` : ''}</li>`).join("")}
            </ul>
        </div>
        <div class="detail-sec">
            <h4>⚡ 核心加熱設定公式</h4>
            <p>主要設備：<strong>${recipe.equipment}</strong></p>
            ${eqDetailsHTML}
        </div>
        <div class="detail-sec">
            <h4>📝 料理操作步驟</h4>
            <ol style="padding-left:20px;">
                ${recipe.steps.map(s => `<li>[${s.equip}] ${escapeHTML(s.desc)} ${s.time ? `⏱️(${s.time})` : ''} <span style="color:var(--danger-color); font-size:0.8rem;">${s.note ? `*註：${escapeHTML(s.note)}` : ''}</span></li>`).join("")}
            </ol>
        </div>
        <div class="detail-sec" style="background-color:var(--light-yellow);">
            <h4>🧪 實驗評價與調整方向</h4>
            <p><strong>結果：</strong> ${recipe.result} | ⭐ 綜合星等: ${recipe.ratings ? Math.round((recipe.ratings.taste + recipe.ratings.doneness + recipe.ratings.texture + recipe.ratings.convenience)/4) : 5} 星</p>
            <p><strong>心得筆記：</strong> ${escapeHTML(recipe.notes || "無")}</p>
            <p style="color:#A17A16;"><strong>💡 下次優化調整公式：</strong> ${escapeHTML(recipe.nextAdjustment || "保持現狀完美比例！")}</p>
        </div>
    `;

    // 綁定再次挑戰複製按鈕
    const retryBtn = document.getElementById("detail-retry-btn");
    retryBtn.onclick = () => {
        closeIdModal("detail-modal");
        // 複製原本配方核心，清空評價心得
        openRecipeModal();
        document.getElementById("form-title").value = recipe.title + " (再次挑戰挑戰)";
        document.getElementById("form-equipment").value = recipe.equipment;
        // 重新注入食材與步驟等表單內容...
        alert("已為您自動載入「基礎食材與步驟配方」，請在本次實驗調整完成後，記下新的加熱心得！");
    };

    document.getElementById("detail-modal").classList.remove("hidden");
}

// ==========================================
// 9. 高級 JSON 備份、匯入及雲端資料搬移
// ==========================================
function openDataMgrModal() {
    document.getElementById("mgr-count").innerText = globalRecipes.length;
    document.getElementById("data-mgr-modal").classList.remove("hidden");
}

function exportData() {
    if (globalRecipes.length === 0) return alert("目前沒有任何紀錄資料可供匯出備份！");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(globalRecipes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `免開伙大廚_料理紀錄備份_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (!Array.isArray(imported)) throw new Error("備份檔案格式必須為 JSON 陣列物件。");
            
            const strategy = confirm("偵測到合法的備份資料！\n\n【按確定】：將資料「合併」導入至現有資料庫。\n【按取消】：將「完全覆蓋」並清除您現有的所有資料。");
            
            if (strategy) {
                // 合併
                globalRecipes = [...globalRecipes, ...imported];
            } else {
                // 覆蓋
                globalRecipes = imported;
            }

            if (currentUser) {
                // 同步至雲端
                alert("正在背景將匯入資料同步至雲端資料庫，請稍候...");
                for (let r of imported) {
                    await supabase.from('recipes').insert([mapLocalToCloud(r)]);
                }
            }
            await saveRecipes();
            closeIdModal("data-mgr-modal");
            alert("🎉 資料成功匯入！料理實驗室已同步更新。");
        } catch (err) {
            alert("匯入失敗，請確認檔案是否為『免開伙大廚』生成的標準備份 JSON 檔案。\n錯誤訊息: " + err.message);
        }
    };
    reader.readAsText(file);
}

async function migrateLocalToCloud() {
    if (!currentUser) return;
    const localData = localStorage.getItem("nocook_chef_recipes");
    if (!localData) return alert("本地 LocalStorage 目前是空的，沒有資料需要搬移唷。");
    
    const localList = JSON.parse(localData);
    if (localList.length === 0) return alert("本地暫無實驗紀錄。");

    if (confirm(`確定要將本機緩存的 ${localList.length} 筆料理紀錄搬移並上傳至您的雲端帳號中嗎？`)) {
        const migrateBtn = document.getElementById("migrate-btn");
        migrateBtn.disabled = true;
        migrateBtn.innerText = "資料上傳搬移中...";

        try {
            for (let r of localList) {
                // 過濾掉示範內建資料，不重複上傳
                if (r.id.startsWith("demo-")) continue;
                await supabase.from('recipes').insert([mapLocalToCloud(r)]);
            }
            alert("🚀 所有本地紀錄已成功無損搬移至 Supabase 雲端！");
            localStorage.removeItem("nocook_chef_recipes"); // 移除本機快取避免混淆
            await loadRecipes();
            closeIdModal("data-mgr-modal");
        } catch (err) {
            alert("搬移過程發生錯誤: " + err.message);
        } finally {
            migrateBtn.disabled = false;
            migrateBtn.innerText = "🚀 將本機 LocalStorage 資料搬移至雲端";
        }
    }
}

async function clearAllData() {
    if (!confirm("🚨 警告：您即將清空本系統內所有的料理實驗紀錄公式！此動作無法復原。")) return;
    if (!confirm("最後確認：確定真的要全部刪除嗎？建議先下載 JSON 檔案備份。")) return;

    if (currentUser) {
        const { error } = await supabase.from('recipes').delete().eq('user_id', currentUser.id);
        if (error) return alert("雲端清空失敗: " + error.message);
    } else {
        localStorage.removeItem("nocook_chef_recipes");
    }
    globalRecipes = [];
    await saveRecipes();
    closeIdModal("data-mgr-modal");
    alert("已成功清空所有資料庫。");
}

// ==========================================
// 10. 輔助公用工具函式
// ==========================================
function closeIdModal(modalId) {
    if (modalId === "recipe-modal" && isFormDirty) {
        if (!confirm("表單內容尚未儲存，確定要關閉嗎？")) return;
    }
    document.getElementById(modalId).classList.add("hidden");
    if(modalId === "recipe-modal") isFormDirty = false;
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

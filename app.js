// ==========================================
// 1. 初始化 Supabase 用戶端設定（已暫時關閉雲端，改為純本地 MVP 模式）
// ==========================================
let supabase = null; // 強迫腳本跳過雲端初始化，直接走 LocalStorage

// 全域狀態管理變數
let globalRecipes = [];
let currentUser = null;
... (後面程式碼完全不動)

// 全域狀態管理變數
let globalRecipes = [];
let currentUser = null;
let isFormDirty = false;
let shoppingCartIngredients = []; // 🛒 採買清單數組

// 4 筆內建大廚金牌示範公式
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
// 2. 生命週期與核心事件初始化
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    initDOMEvents();
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        updateUserStatus(session?.user || null);
        supabase.auth.onAuthStateChange((_event, session) => {
            updateUserStatus(session?.user || null);
        });
    } else {
        document.getElementById("user-status").innerHTML = "⚠️ 未設定雲端金鑰 (本地模式)";
        loadRecipes();
    }
    renderShoppingCart();
});

function initDOMEvents() {
    // 基礎開關彈窗
    document.getElementById("auth-btn").addEventListener("click", handleAuthAction);
    document.getElementById("open-add-modal-btn").addEventListener("click", () => openRecipeModal());
    document.getElementById("open-data-mgr-btn").addEventListener("click", openDataMgrModal);
    
    document.getElementById("close-recipe-modal").addEventListener("click", () => closeIdModal("recipe-modal"));
    document.getElementById("cancel-recipe-btn").addEventListener("click", () => closeIdModal("recipe-modal"));
    document.getElementById("close-detail-modal").addEventListener("click", () => closeIdModal("detail-modal"));
    document.getElementById("detail-close-btn").addEventListener("click", () => closeIdModal("detail-modal"));
    document.getElementById("close-data-modal").addEventListener("click", () => closeIdModal("data-mgr-modal"));
    document.getElementById("close-auth-modal").addEventListener("click", () => closeIdModal("auth-modal"));
    
    // 動態表單增減
    document.getElementById("add-ingredient-btn").addEventListener("click", () => addIngredientRow());
    document.getElementById("add-step-btn").addEventListener("click", () => addStepRow());
    document.getElementById("form-equipment").addEventListener("change", toggleEquipmentPanels);
    document.getElementById("mw-segmented").addEventListener("change", (e) => {
        document.getElementById("mw-segments").classList.toggle("hidden", !e.target.checked);
    });
    document.getElementById("save-recipe-btn").addEventListener("click", handleSaveRecipe);

    // 🧮 自動換算器即時監聽
    document.getElementById("calc-recipe-w").addEventListener("input", calculateMicrowaveTime);
    document.getElementById("calc-recipe-m").addEventListener("input", calculateMicrowaveTime);
    document.getElementById("calc-recipe-s").addEventListener("input", calculateMicrowaveTime);
    document.getElementById("calc-home-w").addEventListener("input", calculateMicrowaveTime);

    // 🛒 購物車清空按鈕
    document.getElementById("clear-cart-btn").addEventListener("click", () => {
        if (shoppingCartIngredients.length > 0 && confirm("確定要清空這張採買便條紙嗎？")) {
            shoppingCartIngredients = [];
            renderShoppingCart();
        }
    });

    // 搜尋功能
    document.getElementById("search-input").addEventListener("input", filterRecipes);
    document.querySelectorAll("#quick-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll("#quick-filters .filter-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            filterRecipes();
        });
    });

    // 備份管理
    document.getElementById("export-btn").addEventListener("click", exportData);
    document.getElementById("import-file").addEventListener("change", importData);
    document.getElementById("clear-all-btn").addEventListener("click", clearAllData);
    document.getElementById("send-magic-link-btn").addEventListener("click", sendMagicLink);
    document.getElementById("migrate-btn").addEventListener("click", migrateLocalToCloud);

    document.getElementById("recipe-form").addEventListener("input", () => { isFormDirty = true; });
}

// ==========================================
// 3. 🧮 微波爐功率加熱換算器核心邏輯
// ==========================================
function calculateMicrowaveTime() {
    const recipeW = parseFloat(document.getElementById("calc-recipe-w").value) || 0;
    const recipeM = parseFloat(document.getElementById("calc-recipe-m").value) || 0;
    const recipeS = parseFloat(document.getElementById("calc-recipe-s").value) || 0;
    const homeW = parseFloat(document.getElementById("calc-home-w").value) || 0;
    const resultDiv = document.getElementById("calc-result");

    if (recipeW <= 0 || homeW <= 0 || (recipeM === 0 && recipeS === 0)) {
        resultDiv.innerText = "請輸入正確數值";
        return;
    }

    const totalRecipeSeconds = (recipeM * 60) + recipeS;
    const totalHomeSeconds = Math.round((recipeW * totalRecipeSeconds) / homeW);
    const homeM = Math.floor(totalHomeSeconds / 60);
    const homeS = totalHomeSeconds % 60;

    resultDiv.innerText = homeM > 0 ? `${homeM} 分 ${homeS} 秒` : `${homeS} 秒`;
}

// ==========================================
// 4. 🛒 採買清單購物車核心邏輯
// ==========================================
function addRecipeIngredientsToCart(recipeId) {
    const recipe = globalRecipes.find(r => r.id === recipeId);
    if (!recipe || !recipe.ingredients) return;

    recipe.ingredients.forEach(ing => {
        const isDuplicate = shoppingCartIngredients.some(item => item.name === ing.name && item.amount === ing.amount);
        if (!isDuplicate) {
            shoppingCartIngredients.push({
                name: ing.name,
                amount: ing.amount,
                completed: false,
                sourceTitle: recipe.title
            });
        }
    });
    renderShoppingCart();
    alert(`已成功將「${recipe.title}」的食材加入下方採買便條紙！`);
}

function renderShoppingCart() {
    const container = document.getElementById("shopping-list-container");
    container.innerHTML = "";

    if (shoppingCartIngredients.length === 0) {
        container.innerHTML = `<li class="cart-empty">目前採買便條紙還是空的，快去挑選想挑戰的料理吧！</li>`;
        return;
    }

    shoppingCartIngredients.forEach((item, idx) => {
        const li = document.createElement("li");
        if (item.completed) li.className = "completed";

        li.innerHTML = `
            <input type="checkbox" id="ing-cart-${idx}" ${item.completed ? "checked" : ""}>
            <label for="ing-cart-${idx}" style="cursor:pointer; font-weight:normal; flex-grow:1;">
                <strong>${escapeHTML(item.name)}</strong> - ${escapeHTML(item.amount)} 
                <span style="font-size:0.75rem; color:var(--text-muted);">(${escapeHTML(item.sourceTitle)})</span>
            </label>
            <button class="btn btn-text btn-sm" style="color:var(--danger-color); text-decoration:none;" onclick="removeCartItem(${idx})">❌</button>
        `;

        li.querySelector('input').addEventListener('change', (e) => {
            shoppingCartIngredients[idx].completed = e.target.checked;
            renderShoppingCart();
        });
        container.appendChild(li);
    });
}

function removeCartItem(idx) {
    shoppingCartIngredients.splice(idx, 1);
    renderShoppingCart();
}

// ==========================================
// 5. 雲端同步與帳號整合邏輯
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
            alert("本站目前未配置 Supabase 金鑰，請開啟金鑰即可運作雲端同步！");
            return;
        }
        document.getElementById("auth-modal").classList.remove("hidden");
    }
}

async function sendMagicLink() {
    const email = document.getElementById("auth-email").value.trim();
    if (!email) return alert("請輸入有效的 Email 信箱。");
    const { error } = await supabase.auth.signInWithOtp({
        email: email, options: { emailRedirectTo: window.location.href }
    });
    if (error) { alert("發送失敗: " + error.message); } 
    else { alert("🚀 登入連結已發送至您的信箱，點擊連結即可自動登入！"); closeIdModal("auth-modal"); }
}

// ==========================================
// 6. 資料庫 CRUD 與渲染核心
// ==========================================
async function loadRecipes() {
    if (currentUser) {
        try {
            const { data, error } = await supabase.from('recipes').select('*').order('date', { ascending: false });
            if (error) throw error;
            globalRecipes = data.map(r => mapCloudToLocal(r));
        } catch (err) {
            globalRecipes = [];
        }
    } else {
        const localData = localStorage.getItem("nocook_chef_recipes");
        if (localData) { globalRecipes = JSON.parse(localData); } 
        else { globalRecipes = [...DEMO_RECIPES]; localStorage.setItem("nocook_chef_recipes", JSON.stringify(globalRecipes)); }
    }
    renderRecipes(globalRecipes);
    updateDashboardStats();
}

async function saveRecipes() {
    if (currentUser) { await loadRecipes(); } 
    else { localStorage.setItem("nocook_chef_recipes", JSON.stringify(globalRecipes)); renderRecipes(globalRecipes); updateDashboardStats(); }
}

function mapLocalToCloud(r) {
    return {
        id: r.id.startsWith("demo-") || r.id.startsWith("rec_") ? undefined : r.id,
        user_id: currentUser ? currentUser.id : undefined,
        title: r.title, date: r.date || null, category: r.category, tags: r.tags,
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

function renderRecipes(recipesList) {
    const grid = document.getElementById("recipes-grid");
    const emptyState = document.getElementById("empty-state");
    grid.innerHTML = "";

    if (recipesList.length === 0) { emptyState.classList.remove("hidden"); return; }
    emptyState.classList.add("hidden");

    recipesList.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        let badgeClass = recipe.result === "大成功" || recipe.result === "成功" ? "badge-success" : (recipe.result === "待改進" ? "badge-warning" : "badge-danger");
        const fallbackImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23F2EFE5'/><text x='50%' y='55%' font-size='30' text-anchor='middle'>🍳</text></svg>";

        card.innerHTML = `
            <img src="${recipe.image || fallbackImg}" class="card-img" alt="${recipe.title}" onerror="this.src='${fallbackImg}'">
            <div class="card-content">
                <div class="card-header-row">
                    <h3 class="card-title">${escapeHTML(recipe.title)}</h3>
                    <span class="card-badge ${badgeClass}">${recipe.result}</span>
                </div>
                <p class="card-meta">📅 ${recipe.date} | ⏱️ ${recipe.totalTime || '未計'}</p>
                <p class="card-meta">⚡ 設備：<strong>${recipe.equipment}</strong></p>
                <div class="card-tags">${(recipe.tags || []).map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join("")}</div>
                <div class="card-footer-actions">
                    <button class="btn btn-secondary btn-sm" onclick="addRecipeIngredientsToCart('${recipe.id}')">🛒 採買</button>
                    <button class="btn btn-secondary btn-sm" onclick="viewRecipeDetail('${recipe.id}')">📖 詳情</button>
                    <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${recipe.id}')">✏️ 編輯</button>
                    <button class="btn btn-danger btn-sm" style="padding:5px 8px;" onclick="deleteRecipe('${recipe.id}')">🗑️</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateDashboardStats() {
    document.getElementById("stat-total").innerText = globalRecipes.length;
    document.getElementById("stat-success").innerText = globalRecipes.filter(r => r.result === "大成功" || r.result === "成功").length;
    const eqCounts = {}; globalRecipes.forEach(r => { if(r.equipment) eqCounts[r.equipment] = (eqCounts[r.equipment] || 0) + 1; });
    let maxEq = "無", maxCount = 0; for (let eq in eqCounts) { if(eqCounts[eq] > maxCount) { maxCount = eqCounts[eq]; maxEq = eq; } }
    document.getElementById("stat-device").innerText = maxEq;

    const pool = globalRecipes.filter(r => r.result === "大成功" || r.result === "成功");
    const recBox = document.getElementById("random-recommend-box");
    if (pool.length > 0) {
        recBox.classList.remove("hidden");
        const rand = pool[Math.floor(Math.random() * pool.length)];
        document.getElementById("recommend-content").innerHTML = `<span style="cursor:pointer; font-weight:bold; text-decoration:underline;" onclick="viewRecipeDetail('${rand.id}')">👉 ${escapeHTML(rand.title)} (${rand.equipment}) - 「${escapeHTML(rand.notes || '完美加熱比例')}」</span>`;
    } else { recBox.classList.add("hidden"); }
}

function filterRecipes() {
    const searchKeyword = document.getElementById("search-input").value.toLowerCase().trim();
    const filterType = document.querySelector("#quick-filters .filter-btn.active").getAttribute("data-filter");

    const filtered = globalRecipes.filter(recipe => {
        const matchKeyword = !searchKeyword || recipe.title.toLowerCase().includes(searchKeyword) || (recipe.notes && recipe.notes.toLowerCase().includes(searchKeyword)) || recipe.ingredients.some(i => i.name.toLowerCase().includes(searchKeyword));
        let matchFilter = true;
        if (filterType === "微波爐" || filterType === "電鍋" || filterType === "微波爐＋電鍋") matchFilter = (recipe.equipment === filterType);
        else if (filterType === "成功") matchFilter = (recipe.result === "大成功" || recipe.result === "成功");
        else if (filterType === "待改進") matchFilter = (recipe.result === "待改進" || recipe.result === "失敗");
        return matchKeyword && matchFilter;
    });
    renderRecipes(filtered);
}

// ==========================================
// 7. 表單彈窗控制及資料處理
// ==========================================
function openRecipeModal(recipeId = null) {
    isFormDirty = false;
    document.getElementById("recipe-form").reset();
    document.getElementById("ingredients-container").innerHTML = "";
    document.getElementById("steps-container").innerHTML = "";

    if (recipeId) {
        document.getElementById("modal-title").innerText = "✏️ 編輯料理實驗紀錄";
        const r = globalRecipes.find(recipe => recipe.id === recipeId);
        if (!r) return;

        document.getElementById("form-recipe-id").value = r.id;
        document.getElementById("form-title").value = r.title;
        document.getElementById("form-date").value = r.date;
        document.getElementById("form-category").value = r.category;
        document.getElementById("form-image").value = r.image || "";
        document.getElementById("form-equipment").value = r.equipment;
        document.getElementById("form-result").value = r.result;
        document.getElementById("form-totaltime").value = r.totalTime || "";
        document.getElementById("form-repeatable").checked = r.isRepeatable !== false;
        document.getElementById("form-notes").value = r.notes || "";
        document.getElementById("form-adjustment").value = r.nextAdjustment || "";
        document.getElementById("rate-taste").value = r.ratings?.taste || 5;
        document.getElementById("rate-doneness").value = r.ratings?.doneness || 5;
        document.getElementById("rate-texture").value = r.ratings?.texture || 5;
        document.getElementById("rate-convenience").value = r.ratings?.convenience || 5;

        document.querySelectorAll("#form-tags input").forEach(cb => cb.checked = r.tags.includes(cb.value));
        if (r.ingredients && r.ingredients.length > 0) r.ingredients.forEach(i => addIngredientRow(i.name, i.amount, i.prep)); else addIngredientRow();
        if (r.steps && r.steps.length > 0) r.steps.forEach(s => addStepRow(s.desc, s.equip, s.time, s.note)); else addStepRow();

        if (r.microwaveSettings) {
            document.getElementById("mw-power").value = r.microwaveSettings.power || "";
            document.getElementById("mw-time").value = r.microwaveSettings.time || "";
            document.getElementById("mw-segmented").checked = r.microwaveSettings.isSegmented || false;
            document.getElementById("mw-segments").value = r.microwaveSettings.segments || "";
            document.getElementById("mw-segments").classList.toggle("hidden", !r.microwaveSettings.isSegmented);
            document.getElementById("mw-container").value = r.microwaveSettings.container || "";
            document.getElementById("mw-cover").checked = r.microwaveSettings.hasCover || false;
            document.getElementById("mw-vents").checked = r.microwaveSettings.hasVents || false;
        }
        if (r.riceCookerSettings) {
            document.getElementById("rc-water").value = r.riceCookerSettings.water || "";
            document.getElementById("rc-simmer").value = r.riceCookerSettings.simmerTime || 0;
            document.getElementById("rc-steamcount").value = r.riceCookerSettings.steamCount || 1;
            document.getElementById("rc-container").value = r.riceCookerSettings.container || "";
            document.getElementById("rc-cover").checked = r.riceCookerSettings.hasCover || false;
            document.getElementById("rc-preheat").checked = r.riceCookerSettings.preheat || false;
        }
    } else {
        document.getElementById("modal-title").innerText = "➕ 新增料理實驗紀錄";
        document.getElementById("form-recipe-id").value = "";
        document.getElementById("form-date").value = new Date().toISOString().split('T')[0];
        addIngredientRow(); addStepRow();
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
    const div = document.createElement("div"); div.className = "dynamic-row ingredient-item";
    div.innerHTML = `<input type="text" placeholder="食材" class="ing-name" value="${escapeHTML(name)}" style="flex:2;"><input type="text" placeholder="份量" class="ing-amount" value="${escapeHTML(amount)}" style="flex:1;"><input type="text" placeholder="備料" class="ing-prep" value="${escapeHTML(prep)}" style="flex:1;"><button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">❌</button>`;
    document.getElementById("ingredients-container").appendChild(div);
}

function addStepRow(desc = "", equip = "無", time = "", note = "") {
    const container = document.getElementById("steps-container");
    const div = document.createElement("div"); div.className = "dynamic-row step-item";
    div.innerHTML = `<span class="step-order" style="font-weight:bold; color:var(--sage-green);">${container.children.length + 1}</span><input type="text" placeholder="操作說明..." class="step-desc" value="${escapeHTML(desc)}" style="flex:3;" required><input type="text" placeholder="設備" class="step-equip" value="${escapeHTML(equip)}" style="flex:1;"><input type="text" placeholder="時間" class="step-time" value="${escapeHTML(time)}" style="flex:1;"><input type="text" placeholder="備註" class="step-note" value="${escapeHTML(note)}" style="flex:1;"><button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove(); reindexSteps();">❌</button>`;
    container.appendChild(div);
}

function reindexSteps() {
    document.querySelectorAll("#steps-container .step-item").forEach((s, i) => s.querySelector(".step-order").innerText = i + 1);
}

async function handleSaveRecipe() {
    const title = document.getElementById("form-title").value.trim();
    if (!title) return alert("請填寫料理實驗名稱！");
    const id = document.getElementById("form-recipe-id").value;

    const tags = []; document.querySelectorAll("#form-tags input:checked").forEach(cb => tags.push(cb.value));
    const ingredients = []; document.querySelectorAll("#ingredients-container .ingredient-item").forEach(row => {
        const n = row.querySelector(".ing-name").value.trim();
        if (n) ingredients.push({ name: n, amount: row.querySelector(".ing-amount").value.trim(), prep: row.querySelector(".ing-prep").value.trim() });
    });
    const steps = []; document.querySelectorAll("#steps-container .step-item").forEach((row, i) => {
        const d = row.querySelector(".step-desc").value.trim();
        if (d) steps.push({ order: i + 1, desc: d, equip: row.querySelector(".step-equip").value.trim(), time: row.querySelector(".step-time").value.trim(), note: row.querySelector(".step-note").value.trim() });
    });

    const recipeData = {
        id: id || "rec_" + Date.now(), title: title, date: document.getElementById("form-date").value, category: document.getElementById("form-category").value, image: document.getElementById("form-image").value.trim(), tags: tags, ingredients: ingredients, equipment: document.getElementById("form-equipment").value,
        microwaveSettings: { power: document.getElementById("mw-power").value, time: document.getElementById("mw-time").value, isSegmented: document.getElementById("mw-segmented").checked, segments: document.getElementById("mw-segments").value, container: document.getElementById("mw-container").value, hasCover: document.getElementById("mw-cover").checked, hasVents: document.getElementById("mw-vents").checked },
        riceCookerSettings: { water: document.getElementById("rc-water").value, simmerTime: parseInt(document.getElementById("rc-simmer").value) || 0, steamCount: parseInt(document.getElementById("rc-steamcount").value) || 1, container: document.getElementById("rc-container").value, hasCover: document.getElementById("rc-cover").checked, preheat: document.getElementById("rc-preheat").checked },
        steps: steps, result: document.getElementById("form-result").value, totalTime: document.getElementById("form-totaltime").value, isRepeatable: document.getElementById("form-repeatable").checked, notes: document.getElementById("form-notes").value, nextAdjustment: document.getElementById("form-adjustment").value, ratings: { taste: parseInt(document.getElementById("rate-taste").value)||5, doneness: parseInt(document.getElementById("rate-doneness").value)||5, texture: parseInt(document.getElementById("rate-texture").value)||5, convenience: parseInt(document.getElementById("rate-convenience").value)||5 }
    };

    if (currentUser) {
        const cloudObj = mapLocalToCloud(recipeData);
        const { error } = id ? await supabase.from('recipes').update(cloudObj).eq('id', id) : await supabase.from('recipes').insert([cloudObj]);
        if (error) return alert("同步失敗: " + error.message);
    } else {
        if (id) { const idx = globalRecipes.findIndex(r => r.id === id); globalRecipes[idx] = recipeData; } else { globalRecipes.unshift(recipeData); }
    }
    isFormDirty = false; await saveRecipes(); closeIdModal("recipe-modal"); alert("🎉 料理公式儲存成功！");
}

async function deleteRecipe(id) {
    if (!confirm("確定要刪除這筆紀錄嗎？")) return;
    if (currentUser) { await supabase.from('recipes').delete().eq('id', id); } else { globalRecipes = globalRecipes.filter(r => r.id !== id); }
    await saveRecipes(); alert("已成功刪除。");
}

function viewRecipeDetail(id) {
    const r = globalRecipes.find(recipe => recipe.id === id); if (!r) return;
    const body = document.getElementById("detail-body");
    let eqHTML = "";
    if (r.equipment.includes("微波爐")) eqHTML += `<p><strong>微波設定：</strong>${r.microwaveSettings?.power || '未註記'} | ${r.microwaveSettings?.time || '未註記'} ${r.microwaveSettings?.isSegmented ? `(${r.microwaveSettings.segments})`:''}</p>`;
    if (r.equipment.includes("電鍋")) eqHTML += `<p><strong>電鍋設定：</strong>外鍋 ${r.riceCookerSettings?.water || '未註記'} 水 | 跳起悶 ${r.riceCookerSettings?.simmerTime || 0} 分鐘</p>`;

    body.innerHTML = `
        <div class="detail-sec"><h3>🍳 ${escapeHTML(r.title)}</h3><p style="font-size:0.85rem;color:var(--text-muted);">${r.category} | ${r.date}</p></div>
        <div class="detail-sec"><h4>🥕 實驗食材比例</h4><ul>${r.ingredients.map(i => `<li><strong>${escapeHTML(i.name)}</strong> - ${escapeHTML(i.amount)}</li>`).join("")}</ul></div>
        <div class="detail-sec"><h4>⚡ 核心加熱設定</h4>${eqHTML}</div>
        <div class="detail-sec"><h4>📝 料理操作步驟</h4><ol style="padding-left:20px;">${r.steps.map(s => `<li>[${s.equip}] ${escapeHTML(s.desc)}</li>`).join("")}</ol></div>
        <div class="detail-sec" style="background-color:var(--light-yellow);"><h4>🧪 下次調整公式建議</h4><p style="color:#A17A16;">${escapeHTML(r.nextAdjustment || "完美黃金比例，保持現狀！")}</p></div>
    `;
    document.getElementById("detail-retry-btn").onclick = () => { closeIdModal("detail-modal"); openRecipeModal(); document.getElementById("form-title").value = r.title + " (再次實驗)"; };
    document.getElementById("detail-modal").classList.remove("hidden");
}

// ==========================================
// 8. 高級 JSON 備份與管理功能
// ==========================================
function openDataMgrModal() { document.getElementById("mgr-count").innerText = globalRecipes.length; document.getElementById("data-mgr-modal").classList.remove("hidden"); }
function exportData() { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(globalRecipes, null, 2)); const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", `免開伙大廚_備份.json`); a.click(); }
function importData(e) {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = async function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            globalRecipes = confirm("【按確定】將與原資料合併；【按取消】將覆蓋清除舊資料。") ? [...globalRecipes, ...imported] : imported;
            if (currentUser) { for (let x of imported) await supabase.from('recipes').insert([mapLocalToCloud(x)]); }
            await saveRecipes(); closeIdModal("data-mgr-modal"); alert("🎉 資料匯入成功！");
        } catch(err) { alert("檔案解析失敗"); }
    }; r.readAsText(file);
}
async function migrateLocalToCloud() {
    const local = localStorage.getItem("nocook_chef_recipes"); if (!local) return alert("本地暫無資料");
    const list = JSON.parse(local); if (confirm(`搬移 ${list.length} 筆資料上雲端？`)) {
        for (let x of list) { if (!x.id.startsWith("demo-")) await supabase.from('recipes').insert([mapLocalToCloud(x)]); }
        localStorage.removeItem("nocook_chef_recipes"); await loadRecipes(); closeIdModal("data-mgr-modal"); alert("🚀 搬移成功！");
    }
}
async function clearAllData() {
    if (confirm("🚨 警告：確定要清空所有紀錄嗎？不可還原！")) {
        if (currentUser) await supabase.from('recipes').delete().eq('user_id', currentUser.id); else localStorage.removeItem("nocook_chef_recipes");
        globalRecipes = []; await saveRecipes(); closeIdModal("data-mgr-modal"); alert("已清空。");
    }
}

function closeIdModal(modalId) { if (modalId === "recipe-modal" && isFormDirty && !confirm("表單未儲存，確定關閉？")) return; document.getElementById(modalId).classList.add("hidden"); if(modalId === "recipe-modal") isFormDirty = false; }
function escapeHTML(str) { if (!str) return ""; return str.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)); }

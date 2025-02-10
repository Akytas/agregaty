document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");
    const adminPanel = document.getElementById("adminPanel");
    const pridatButton = document.getElementById("pridat");
    const seznam = document.getElementById("seznam");
    const passwordInput = document.getElementById("password");

    let upravovanyIndex = null;

    // Přihlášení
    loginButton.addEventListener("click", () => {
        const password = passwordInput.value;
        if (password === "hasici123") {
            localStorage.setItem("isAdmin", "true");
            aktualizovatUI();
        } else {
            alert("Nesprávné heslo!");
        }
    });

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isAdmin");
        aktualizovatUI();
    });

    // Přidání / Úprava agregátu
    pridatButton.addEventListener("click", () => {
        const nazev = document.getElementById("nazev").value;
        const umisteni = document.getElementById("umisteni").value;

        if (nazev && umisteni) {
            let agregaty = JSON.parse(localStorage.getItem("agregaty")) || [];

            if (upravovanyIndex !== null) {
                // Úprava existujícího agregátu
                agregaty[upravovanyIndex] = { 
                    nazev, 
                    umisteni, 
                    posledniPalivo: agregaty[upravovanyIndex].posledniPalivo || "N/A",
                    posledniKontrola: agregaty[upravovanyIndex].posledniKontrola || "N/A",
                    doplnil: agregaty[upravovanyIndex].doplnil || "?",
                    kontroloval: agregaty[upravovanyIndex].kontroloval || "?",
                    motohodiny: agregaty[upravovanyIndex].motohodiny || "N/A"
                };
                upravovanyIndex = null; // Reset indexu pro úpravy
            } else {
                // Přidání nového agregátu
                agregaty.push({ 
                    nazev, 
                    umisteni, 
                    posledniPalivo: "N/A", 
                    posledniKontrola: "N/A",
                    doplnil: "?",
                    kontroloval: "?",
                    motohodiny: "N/A"
                });
            }

            localStorage.setItem("agregaty", JSON.stringify(agregaty));
            document.getElementById("nazev").value = "";
            document.getElementById("umisteni").value = "";
            zobrazSeznam();
        }
    });

    // Zobrazení agregátů
    function zobrazSeznam() {
        seznam.innerHTML = "";
        const agregaty = JSON.parse(localStorage.getItem("agregaty")) || [];

        agregaty.forEach((agregat, index) => {
            const li = document.createElement("li");

            // Výpočet barvy pozadí na základě data poslední kontroly
            let backgroundColor = "#FFCCCC";  // Výchozí barva - červená
            const dnes = new Date();
            const posledniKontrola = new Date(agregat.posledniKontrola);
            const rozdilDni = (dnes - posledniKontrola) / (1000 * 3600 * 24); // Vypočítání rozdílu v dnech

            if (agregat.posledniKontrola !== "N/A") {
                if (rozdilDni <= 30) {
                    backgroundColor = "#90EE90";  // Světle zelená, pokud je kontrola provedena během posledních 30 dní
                } else {
                    backgroundColor = "#FF6347";  // Oranžová, pokud je kontrola starší než 30 dní
                }
            }

            li.innerHTML = `
                <span><strong>${agregat.nazev}</strong> - Umístěno: ${agregat.umisteni} | 
                Poslední doplnění paliva: ${agregat.posledniPalivo} (${agregat.doplnil}) | 
                Poslední kontrola: ${agregat.posledniKontrola} (${agregat.kontroloval}) | 
                Motohodiny: ${agregat.motohodiny}</span>
                <div class="button-container">
                    <button class="edit" onclick="upravAgregat(${index})">✏️ Upravit</button>
                    <button class="delete" onclick="smazAgregat(${index})">🗑️ Smazat</button>
                    <button class="fuel" onclick="doplnPalivo(${index})">⛽ Doplnit palivo</button>
                    <button class="check" onclick="zaznamenatKontrolu(${index})">✅ Kontrola</button>
                </div>
            `;

            li.style.backgroundColor = backgroundColor;  // Nastavení barvy pozadí
            seznam.appendChild(li);
        });
    }

    // Smazání agregátu
    window.smazAgregat = function(index) {
        let agregaty = JSON.parse(localStorage.getItem("agregaty")) || [];
        agregaty.splice(index, 1);
        localStorage.setItem("agregaty", JSON.stringify(agregaty));
        zobrazSeznam();
    };

    // Úprava agregátu
    window.upravAgregat = function(index) {
        let agregaty = JSON.parse(localStorage.getItem("agregaty")) || [];
        document.getElementById("nazev").value = agregaty[index].nazev;
        document.getElementById("umisteni").value = agregaty[index].umisteni;
        upravovanyIndex = index; // Uložení indexu pro úpravu
    };

    // Doplnění paliva + záznam osoby
    window.doplnPalivo = function(index) {
        let agregaty = JSON.parse(localStorage.getItem("agregaty")) || [];
        let inicialy = prompt("Zadejte své iniciály:");

        if (inicialy) {
            agregaty[index].posledniPalivo = new Date().toLocaleDateString();
            agregaty[index].doplnil = inicialy;
            localStorage.setItem("agregaty", JSON.stringify(agregaty));
            zobrazSeznam();
        }
    };

    // Záznam kontroly + záznam motohodin a osoby
    window.zaznamenatKontrolu = function(index) {
        let agregaty = JSON.parse(localStorage.getItem("agregaty")) || [];
        let motohodiny = prompt("Zadejte počet motohodin:");
        if (motohodiny) {
            let inicialy = prompt("Zadejte své iniciály:");
            if (inicialy) {
                agregaty[index].posledniKontrola = new Date().toLocaleDateString();
                agregaty[index].kontroloval = inicialy;
                agregaty[index].motohodiny = motohodiny;  // Uložíme motohodiny

                localStorage.setItem("agregaty", JSON.stringify(agregaty));
                zobrazSeznam();
            }
        }
    };

    // Aktualizace UI podle stavu přihlášení
    function aktualizovatUI() {
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        loginButton.style.display = isAdmin ? "none" : "block";
        logoutButton.style.display = isAdmin ? "block" : "none";
        adminPanel.style.display = isAdmin ? "block" : "none";
        zobrazSeznam();
    }

    // Inicializace
    aktualizovatUI();
});

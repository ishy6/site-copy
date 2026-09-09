type LoginLocaleRow = readonly [
  locale: string,
  name: string,
  title: string,
  subtitle: string,
  action: string,
  legal: string,
  termsLabel: string,
  privacyLabel: string,
  error: string,
  placeholder: string,
  changeLanguage: string,
]

const loginLocaleRows = [
  ["bg-BG", "Български", "Влизане в Shop", "Или създаване на профил", "Продължи", "Ако продължите, приемате условията и правилата за повелителност.", "условията", "правилата за повелителност", "Въведете валиден имейл адрес", "Въведете своя имейл адрес", "Смяна на езика"],
  ["cs", "Čeština", "Přihlaste se do Shop", "nebo si vytvořte účet", "Pokračovat", "Když budete pokračovat, souhlasíte s podmínkami a berete na vědomí zásadami ochrany osobních údajů.", "podmínkami", "zásadami ochrany osobních údajů", "Zadejte platnou e-mailovou adresu", "Zadejte svůj e-mail", "Změnit jazyk"],
  ["da", "Dansk", "Log ind på Shop", "Eller opret en konto", "Fortsæt", "Ved at fortsætte accepterer du vilkår og anerkender politik om beskyttelse af persondata.", "vilkår", "politik om beskyttelse af persondata", "Angiv en gyldig mailadresse", "Angiv din mailadresse", "Skift sprog"],
  ["de", "Deutsch", "Im Shop anmelden", "Oder ein Konto erstellen", "Weiter", "Indem du fortfährst, stimmst du den allgemeinen Geschäftsbedingungen zu und nimmst die Datenschutzerklärung zur Kenntnis.", "allgemeinen Geschäftsbedingungen", "Datenschutzerklärung", "Bitte gib eine gültige E-Mail-Adresse ein", "Deine E-Mail-Adresse eingeben", "Sprache ändern"],
  ["el", "Ελληνικά", "Σύνδεση στο Shop", "Ή δημιουργία λογαριασμού", "Συνέχεια", "Συνεχίζοντας, συμφωνείτε με τους όροι και αποδέχεστε την πολιτική απορρήτου.", "όροι", "πολιτική απορρήτου", "Εισαγάγετε έγκυρη διεύθυνση email", "Εισαγάγετε το email σας", "Αλλαγή γλώσσας"],
  ["en", "English", "Sign in to Shop", "Or create an account", "Continue", "By continuing, you agree to the terms and acknowledge the privacy policy.", "terms", "privacy policy", "Please enter a valid email address", "Enter your email", "Change language"],
  ["es", "Español", "Iniciar sesión en Shop", "O crea una cuenta", "Continuar", "Si continúas, aceptas los términos y declaras conocer la política de privacidad.", "términos", "política de privacidad", "Escribe una dirección de correo electrónico válida", "Introduce tu correo electrónico", "Cambiar idioma"],
  ["fi", "Suomi", "Kirjaudu sisään Shopiin", "tai luo tili", "Jatka", "Jatkamalla hyväksyt asiakirjan ehdot ja vahvistat tutustuneesi asiakirjaan tietosuojakäytäntö.", "ehdot", "tietosuojakäytäntö", "Anna kelvollinen sähköpostiosoite", "Anna sähköpostiosoitteesi", "Vaihda kieli"],
  ["fr", "Français", "Se connecter à Shop", "Ou créer un compte", "Continuer", "En continuant, vous acceptez les conditions et prenez connaissance de la politique de confidentialité.", "conditions", "politique de confidentialité", "Veuillez saisir une adresse e-mail valide", "Saisissez votre adresse e-mail", "Changer la langue"],
  ["hi", "हिन्दी", "Shop में साइन इन करें.", "या एक अकाउंट बनाएं", "जारी रखें", "जारी रखने पर, आप शर्तें से सहमत होते हैं और गोपनीयता नीति को स्वीकार करते हैं।", "शर्तें", "गोपनीयता नीति", "कृपया एक मान्य ईमेल पता दर्ज करें", "अपना ईमेल पता डालें", "भाषा परिवर्तित करें"],
  ["hr-HR", "Hrvatski", "Prijavite se u Shop", "Ili kreirajte račun", "Nastavi", "Nastavkom pristajete na dokument uvjete i prihvaćate dokument pravila zaštite privatnosti.", "uvjete", "pravila zaštite privatnosti", "Unesite valjanu adresu e-pošte", "Unesite svoju adresu e-pošte", "Promijeni jezik"],
  ["hu", "Magyar", "Bejelentkezés a Shopba", "vagy fiók létrehozása", "Folytatás", "A folytatással elfogadja a következőt: használati feltételeiben, és tudomásul veszi a következőt: adatvédelmi szabályzatában.", "használati feltételeiben", "adatvédelmi szabályzatában", "Írj be egy érvényes e-mail-címet.", "E-mail-cím megadása", "Nyelv módosítása"],
  ["id", "Bahasa Indonesia", "Masuk ke Shop", "Atau buat akun", "Lanjutkan", "Dengan melanjutkan, Anda menyetujui ketentuan dan memahami kebijakan privasi.", "ketentuan", "kebijakan privasi", "Harap masukkan alamat email yang valid", "Masukkan email Anda", "Ganti bahasa"],
  ["it", "Italiano", "Accedi a Shop", "O crea un account", "Continua", "Continuando, accetti termini e prendi visione di informativa sulla privacy.", "termini", "informativa sulla privacy", "Inserisci un indirizzo email valido", "Inserisci indirizzo email", "Cambia lingua"],
  ["ja", "日本語", "Shop にログイン", "またはアカウントを作成", "続行する", "続行すると、規約 に同意し、プライバシーポリシー を確認したものとみなされます。", "規約", "プライバシーポリシー", "有効なメールアドレスを入力してください", "メールアドレスを入力", "言語を変更する"],
  ["ko", "한국어", "Shop에 로그인", "또는 계정 생성", "계속", "계속 진행하면 약관에 동의하고 개인정보처리방침을(를) 인지한 것으로 간주됩니다.", "약관", "개인정보처리방침", "유효한 이메일 주소를 입력하십시오", "이메일을 입력하세요", "언어 변경"],
  ["lt-LT", "Lietuvių", "Prisijungti prie „Shop“", "Arba kurti paskyrą", "Tęsti", "Tęsdami sutinkate su sąlygomis ir pripažįstate privatumo politika.", "sąlygomis", "privatumo politika", "Įveskite teisingą el. pašto adresą", "Įveskite savo el. pašto adresą", "Pakeisti kalbą"],
  ["ms", "Bahasa Melayu", "Daftar masuk ke Shop", "Atau cipta akaun", "Teruskan", "Dengan meneruskan, anda bersetuju dengan terma dan mengakui dasar privasi.", "terma", "dasar privasi", "Sila masukkan alamat e-mel yang sah", "Masukkan e-mel anda", "Ubah bahasa"],
  ["nb", "Norsk (bokmål)", "Logg inn på Shop", "Eller opprett en konto", "Fortsett", "Ved å fortsette godtar du vilkår og anerkjenner personvernerklæring.", "vilkår", "personvernerklæring", "Angi en gyldig e-postadresse", "Skriv e-posten", "Endre språk"],
  ["nl", "Nederlands", "Inloggen bij Shop", "Of een account aanmaken", "Doorgaan", "Door verder te gaan, ga je akkoord met de voorwaarden en het privacybeleid.", "voorwaarden", "privacybeleid", "Voer een geldig e-mailadres in", "Voer je e-mailadres in", "Taal wijzigen"],
  ["pl", "Polski", "Zaloguj się do aplikacji Shop", "lub utwórz konto", "Kontynuuj", "Kontynuując, akceptujesz warunki i przyjmujesz do wiadomości politykę prywatności.", "warunki", "politykę prywatności", "Wprowadź prawidłowy adres e-mail", "Wprowadź swój e-mail", "Zmień język"],
  ["pt-BR", "Português (Brasil)", "Fazer login no Shop", "Ou criar uma conta", "Continuar", "Ao continuar, você concorda com os termos e reconhece a política de privacidade.", "termos", "política de privacidade", "Insira um e-mail válido", "Insira seu e-mail", "Alterar idioma"],
  ["pt-PT", "Português", "Iniciar sessão no Shop", "Ou crie uma conta", "Continuar", "Ao continuar, aceita os termos e toma conhecimento da política de privacidade.", "termos", "política de privacidade", "Introduza um endereço de e-mail válido", "Introduza o seu e-mail", "Alterar idioma"],
  ["ro-RO", "Română", "Conectează-te la Shop", "Sau creează un cont", "Continuă", "Continuând,accepți termenii și confirmi că ai luat la cunoștință politica de confidențialitate.", "termenii", "politica de confidențialitate", "Introdu o adresă de e-mail validă", "Introdu adresa de e-mail", "Schimbă limba"],
  ["ru", "Русский", "Войти в Shop", "Или создайте учетную запись", "Продолжить", "Продолжая, вы принимаете условия и соглашаетесь с политика конфиденциальности.", "условия", "политика конфиденциальности", "Укажите действительный адрес электронной почты.", "Введите адрес электронной почты", "Изменить язык"],
  ["sk-SK", "Slovenčina", "Prihláste sa do aplikácie Shop", "Alebo si vytvorte konto", "Pokračovať", "Pokračovaním vyjadrujete svoj súhlas s podmienky a pravidlá ochrany súkromia.", "podmienky", "pravidlá ochrany súkromia", "Zadajte platnú e-mailovú adresu", "Zadajte svoj e-mail", "Zmeniť jazyk"],
  ["sl-SI", "Slovenščina", "Prijava v Shop", "Ali ustvarite račun", "Nadaljuj", "Če nadaljujete, se strinjate z dokumentom pogoji in potrjujete, da ste prebrali pravilnik o zasebnosti.", "pogoji", "pravilnik o zasebnosti", "Vnesite veljaven e-poštni naslov", "Vnesite e-poštni naslov", "Sprememba jezika"],
  ["sv", "Svenska", "Logga in på Shop", "Eller skapa ett konto", "Fortsätt", "Genom att fortsätta godkänner du villkor och bekräftar att du tagit del av integritetspolicy.", "villkor", "integritetspolicy", "Ange en giltig e-postadress", "Ange din e-postadress", "Ändra språk"],
  ["th", "ภาษาไทย", "ลงชื่อเข้าใช้ Shop", "หรือสร้างบัญชีผู้ใช้", "ดำเนินการต่อ", "หากดำเนินการต่อ แสดงว่าคุณยอมรับเงื่อนไขและรับทราบนโยบายความเป็นส่วนตัว", "เงื่อนไข", "นโยบายความเป็นส่วนตัว", "โปรดป้อนที่อยู่อีเมลที่ถูกต้อง", "ป้อนอีเมลของคุณ", "เปลี่ยนภาษา"],
  ["tr", "Türkçe", "Shop'a giriş yapın", "Veya hesap oluşturun", "Devam", "Devam ettiğinizde şartlarını metnini kabul etmiş ve gizlilik politikası metnini onaylamış olursunuz.", "şartlarını", "gizlilik politikası", "Lütfen geçerli bir e-posta adresi girin", "E-postanızı girin", "Dili değiştir"],
  ["vi", "Tiếng Việt", "Đăng nhập vào Shop", "Hoặc tạo tài khoản", "Tiếp tục", "Khi tiếp tục, bạn đồng ý với điều khoản và xác nhận chính sách quyền riêng tư.", "điều khoản", "chính sách quyền riêng tư", "Vui lòng nhập địa chỉ email hợp lệ", "Nhập email của bạn", "Thay đổi ngôn ngữ"],
  ["zh-CN", "简体中文", "登录 Shop", "或创建账户", "继续", "继续操作即表示您同意 条款 并知悉 隐私政策。", "条款", "隐私政策", "请输入有效的邮箱", "输入您的邮箱", "更改语言"],
  ["zh-TW", "繁體中文", "登入 Shop", "或建立帳戶", "繼續", "繼續操作，即代表您同意 條款，並已知悉 隱私權政策。", "條款", "隱私權政策", "請輸入有效的電子郵件地址", "輸入您的電子郵件", "變更語言"],
] as const satisfies readonly LoginLocaleRow[]

export type LoginLocale = typeof loginLocaleRows[number][0]

export type LoginLocaleCopy = {
  locale: LoginLocale
  name: string
  title: string
  subtitle: string
  action: string
  legal: string
  termsLabel: string
  privacyLabel: string
  error: string
  placeholder: string
  changeLanguage: string
}

export const loginLocaleOptions: LoginLocaleCopy[] = loginLocaleRows.map(([
  locale,
  name,
  title,
  subtitle,
  action,
  legal,
  termsLabel,
  privacyLabel,
  error,
  placeholder,
  changeLanguage,
]) => ({ locale, name, title, subtitle, action, legal, termsLabel, privacyLabel, error, placeholder, changeLanguage }))

export const loginLocaleByCode = Object.fromEntries(
  loginLocaleOptions.map((locale) => [locale.locale, locale]),
) as Record<LoginLocale, LoginLocaleCopy>

export function isLoginLocale(value: string | null): value is LoginLocale {
  return Boolean(value && value in loginLocaleByCode)
}

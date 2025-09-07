# DUBAI AI (DBAI)

BEP‑20 (ERC‑20 uyumlu) hayır odaklı token:
- Sabit %1 transfer kesintisi Charity Wallet’a gider.
- Burnable, Pausable, Ownable (non‑upgradeable).
- Toplam arz: 1,000,000,000 DBAI (18 decimals).

Kontratlar `OpenZeppelin` v5 üzerine inşa edilmiştir.

## Yapı
- `contracts/DBAI.sol`: Ana token kontratı. Özellikler: `ERC20`, `ERC20Burnable`, `ERC20Pausable`, `Ownable` ve sabit %1 charity fee.
- `contracts/LinearTokenVesting.sol`: Tek yararlanıcılı, cliff + lineer açılım yapan kilit kontratı.
- `scripts/deploy.js`: BSC mainnet’e token deploy scripti.
- `scripts/verify.js`: BscScan doğrulama scripti.
- `scripts/deploy_vesting.js`: Örnek yararlanıcı listesi için vesting kontratlarını deploy eder (fonları sonradan bu kontratlara transfer edersiniz).
- `.env.example`: Ortam değişkeni örnekleri.

## Gereksinimler
- Node.js 18+
- Bir EVM cüzdan private key’i (BNB Chain mainnet’te yeterli BNB bakiyesi ile)
- BscScan API key (doğrulama için)

## Kurulum
```bash
npm install
cp .env.example .env
# .env dosyasını düzenleyin.
```

`.env` içindeki kritik alanlar:
- `PRIVATE_KEY` – deploy edecek cüzdanın private key’i
- `BSCSCAN_API_KEY` – BscScan doğrulama anahtarı
- `OWNER_ADDRESS` – DBAI sözleşmesinin sahibi (ilk arzı alır, pause/fee-exempt/charity ayarlarını yönetir)
- `CHARITY_WALLET_ADDRESS` – %1 kesintinin aktarılacağı şeffaf bağış cüzdanı

## Derleme
```bash
npx hardhat compile
```

## BSC Mainnet’e Dağıtım
Uyarı: Mainnet dağıtımı geri alınamaz ve gas maliyeti vardır. Değerleri iki kez kontrol edin.
```bash
npx hardhat run scripts/deploy.js --network bsc
```
Çıktıdaki adresi `.env` içinde `CONTRACT_ADDRESS` olarak girin.

## Doğrulama (BscScan)
```bash
npx hardhat run scripts/verify.js --network bsc
```

## Vesting Kontratları Dağıtımı (Opsiyonel)
Örnek/placeholder adreslerle vesting kasaları kurabilirsiniz. Dağıtım sonrası ilgili DBAI tahsislerini bu kontratlara transfer edersiniz.

`.env` set edin:
- `VESTING_TOKEN_ADDRESS` – Dağıttığınız `DBAI` sözleşme adresi
- `VESTING_START_TIMESTAMP` – Vesting başlangıcı (Unix epoch saniye)
- `VESTING_CLIFF_SECONDS` – Cliff süresi (>= 12 ay önerilir: 31536000)
- `VESTING_TOTAL_DURATION_SECONDS` – Toplam vesting süresi (ör. 24 ay: 63072000)
- `BENEFICIARY_ADDRESSES` – Virgülle ayrılmış EVM adresleri

Çalıştırın:
```bash
npx hardhat run scripts/deploy_vesting.js --network bsc
```

Sonraki adım: Her yararlanıcı için ilgili vesting kontratına tahsis edilen DBAI miktarını transfer edin. Kilit ve açılım mantığı kontrat içinde otomatik işler.

## Fee Muafiyetleri ve Öneriler
- `DBAI.sol` içinde `setFeeExempt(address,bool)` fonksiyonu ile bazı adresleri kesintiden muaf tutabilirsiniz.
- Tipik adresler: `owner`, `charityWallet`, merkezi kontratlar (vesting), gerektiğinde DEX router/pair adresleri.
- Likidite eklerken fee-on-transfer token davranışlarını dikkate alın. Gerekirse LP pair ve router adreslerini muafiyete ekleyin.

## Operasyonel Komutlar
- Pause: `pause()` – acil durumda transferleri durdurur
- Unpause: `unpause()`
- Charity cüzdanı güncelleme: `setCharityWallet(address)`
- Fee muafiyet: `setFeeExempt(address,bool)`

## Güvenlik ve Uyumluluk Notları
- “Charity” modelinde toplanan fonların harcanması zincir dışı operasyondur; düzenli “Charity Report” paylaşın.
- İsim/marka ve bağış regülasyonlarına uyum için hukuk danışmanına başvurmanız önerilir.

## Sürüm Bilgileri
- Solidity: 0.8.24
- OpenZeppelin: ^5.0.2
- Hardhat: ^2.22.10

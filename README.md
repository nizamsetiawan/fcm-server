# FCM Server for Kenongo Task

Server sederhana untuk mengirim notifikasi FCM ke aplikasi Kenongo Task.

## Setup

1. Download `serviceAccountKey.json` dari Firebase Console:

   - Buka [Firebase Console](https://console.firebase.google.com/)
   - Pilih project Anda
   - Project Settings > Service Accounts
   - Klik "Generate New Private Key"
   - Simpan file sebagai `serviceAccountKey.json` di folder ini

2. Deploy ke Railway:
   - Buka [Railway](https://railway.app/)
   - Buat project baru
   - Upload folder ini (termasuk `serviceAccountKey.json`)
   - Tunggu proses deploy selesai

## Penggunaan

### Endpoint: POST /send-fcm

Body JSON:

```json
{
  "token": "FCM_DEVICE_TOKEN",
  "title": "Judul Notifikasi",
  "body": "Isi Notifikasi",
  "data": {
    "key1": "value1"
  }
}
```

### Contoh Penggunaan di Flutter

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> sendFcmNotification({
  required String serverUrl,
  required String token,
  required String title,
  required String body,
  Map<String, String>? data,
}) async {
  final response = await http.post(
    Uri.parse('$serverUrl/send-fcm'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'token': token,
      'title': title,
      'body': body,
      'data': data ?? {},
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Failed to send FCM: ${response.body}');
  }
}
```

## Catatan

- Pastikan `serviceAccountKey.json` tidak di-share atau di-commit ke repository
- Server ini menggunakan free tier Railway, jadi ada batasan penggunaan
- Untuk produksi, tambahkan autentikasi API

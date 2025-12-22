# API Endpoints for Application Integration

## Production URLs

### YouTube Help Files
**Endpoint:** `https://www.signaltradingbots.com/api/app/youtube-help`

**Method:** `GET`

**Response Format:**
```json
{
  "items": [
    {
      "id": 1,
      "controlName": "Help1",
      "title": "How to Setup Bot",
      "url": "https://youtube.com/watch?v=..."
    },
    {
      "id": 2,
      "controlName": "Help2",
      "title": "Troubleshooting Guide",
      "url": "https://youtube.com/watch?v=..."
    }
    // ... up to 16 items (only items with both title and URL are returned)
  ]
}
```

### News & Updates
**Endpoint:** `https://www.signaltradingbots.com/api/app/news`

**Method:** `GET`

**Response Format:**
```json
{
  "items": [
    {
      "id": 1,
      "controlName": "News1",
      "title": "New Feature Release",
      "url": "https://example.com/news/article1"
    },
    {
      "id": 2,
      "controlName": "News2",
      "title": "System Maintenance Notice",
      "url": "https://example.com/news/article2"
    }
    // ... up to 16 items (only items with both title and URL are returned)
  ]
}
```

## Notes

- Both endpoints return only items that have **both** a title and URL filled in
- Empty items are automatically filtered out
- Maximum 16 items per endpoint
- Items are returned in order (1-16)
- The `id` field corresponds to the item number (1-16)
- The `controlName` field identifies the control/widget name in your application (e.g., "Help1", "Help2" for YouTube help, or "News1", "News2" for news)
- You can customize the `controlName` in the admin pages to match your application's control/widget names

## Example Usage

### C# Example
```csharp
// Fetch YouTube Help
var response = await httpClient.GetAsync("https://www.signaltradingbots.com/api/app/youtube-help");
var data = await response.Content.ReadFromJsonAsync<ApiResponse>();

// Fetch News
var newsResponse = await httpClient.GetAsync("https://www.signaltradingbots.com/api/app/news");
var newsData = await newsResponse.Content.ReadFromJsonAsync<ApiResponse>();

public class ApiResponse
{
    public List<Item> Items { get; set; }
}

public class Item
{
    public int Id { get; set; }
    public string ControlName { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
}
```

### JavaScript/TypeScript Example
```javascript
// Fetch YouTube Help
const response = await fetch('https://www.signaltradingbots.com/api/app/youtube-help');
const data = await response.json();
console.log(data.items); // Array of items

// Fetch News
const newsResponse = await fetch('https://www.signaltradingbots.com/api/app/news');
const newsData = await newsResponse.json();
console.log(newsData.items); // Array of items
```

### Promotional Image

**Endpoint (Image):** `https://www.signaltradingbots.com/api/app/promotional-image`

**Method:** `GET`

**Response:** Returns the image file directly (binary/image data)

**Content-Type:** `image/jpeg`, `image/png`, `image/gif`, or `image/webp` (depending on uploaded format)

**Usage:** Fetch this endpoint to get the promotional image. The response is the actual image file that can be displayed in your application.

---

**Endpoint (Metadata):** `https://www.signaltradingbots.com/api/app/promotional-image/metadata`

**Method:** `GET`

**Response Format:**
```json
{
  "imageUrl": "/api/app/promotional-image",
  "redirectUrl": "https://example.com/promotional-link",
  "hasRedirectUrl": true
}
```

**Response Fields:**
- `imageUrl`: The endpoint path to fetch the image
- `redirectUrl`: The URL where users should be redirected when clicking the image (null if not set)
- `hasRedirectUrl`: Boolean indicating if a redirect URL is configured

**Error Response (404):**
```json
{
  "error": "No promotional image available"
}
```

**Usage:** Fetch this endpoint to get the redirect URL. When a user clicks the promotional image, redirect them to the `redirectUrl` value.

---

## Notes

### YouTube Help & News Endpoints
- Both endpoints return only items that have **both** a title and URL filled in
- Empty items are automatically filtered out
- Maximum 16 items per endpoint
- Items are returned in order (1-16)
- The `id` field corresponds to the item number (1-16)
- The `controlName` field identifies the control/widget name in your application (e.g., "Help1", "Help2" for YouTube help, or "News1", "News2" for news)
- You can customize the `controlName` in the admin pages to match your application's control/widget names

### Promotional Image Endpoint
- The image endpoint returns the actual image file (binary data)
- Use the metadata endpoint to get the redirect URL
- If no image is uploaded, the metadata endpoint returns a 404 error
- The redirect URL is optional - `redirectUrl` will be `null` if not set

---

## Example Usage

### C# Example

#### YouTube Help & News
```csharp
// Fetch YouTube Help
var response = await httpClient.GetAsync("https://www.signaltradingbots.com/api/app/youtube-help");
var data = await response.Content.ReadFromJsonAsync<ApiResponse>();

// Fetch News
var newsResponse = await httpClient.GetAsync("https://www.signaltradingbots.com/api/app/news");
var newsData = await newsResponse.Content.ReadFromJsonAsync<ApiResponse>();

public class ApiResponse
{
    public List<Item> Items { get; set; }
}

public class Item
{
    public int Id { get; set; }
    public string ControlName { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
}
```

#### Promotional Image
```csharp
// Fetch promotional image
var imageResponse = await httpClient.GetAsync("https://www.signaltradingbots.com/api/app/promotional-image");
if (imageResponse.IsSuccessStatusCode)
{
    var imageBytes = await imageResponse.Content.ReadAsByteArrayAsync();
    // Use imageBytes to display the image
}

// Fetch promotional image metadata (redirect URL)
var metadataResponse = await httpClient.GetAsync("https://www.signaltradingbots.com/api/app/promotional-image/metadata");
if (metadataResponse.IsSuccessStatusCode)
{
    var metadata = await metadataResponse.Content.ReadFromJsonAsync<PromotionalImageMetadata>();
    // Use metadata.RedirectUrl when user clicks the image
}

public class PromotionalImageMetadata
{
    public string ImageUrl { get; set; }
    public string RedirectUrl { get; set; }
    public bool HasRedirectUrl { get; set; }
}
```

### JavaScript/TypeScript Example

#### YouTube Help & News
```javascript
// Fetch YouTube Help
const response = await fetch('https://www.signaltradingbots.com/api/app/youtube-help');
const data = await response.json();
console.log(data.items); // Array of items

// Fetch News
const newsResponse = await fetch('https://www.signaltradingbots.com/api/app/news');
const newsData = await newsResponse.json();
console.log(newsData.items); // Array of items
```

#### Promotional Image
```javascript
// Fetch promotional image
const imageResponse = await fetch('https://www.signaltradingbots.com/api/app/promotional-image');
if (imageResponse.ok) {
  const imageBlob = await imageResponse.blob();
  const imageUrl = URL.createObjectURL(imageBlob);
  // Use imageUrl to display the image (e.g., set as src of img tag)
}

// Fetch promotional image metadata (redirect URL)
const metadataResponse = await fetch('https://www.signaltradingbots.com/api/app/promotional-image/metadata');
if (metadataResponse.ok) {
  const metadata = await metadataResponse.json();
  console.log(metadata.redirectUrl); // URL to redirect when image is clicked
  // When user clicks the image, redirect to metadata.redirectUrl
}
```

### Complete Integration Example (JavaScript)

```javascript
// Fetch all data for News and Updates tab
async function loadNewsAndUpdatesData() {
  try {
    // Fetch YouTube Help
    const helpResponse = await fetch('https://www.signaltradingbots.com/api/app/youtube-help');
    const helpData = await helpResponse.json();
    
    // Fetch News
    const newsResponse = await fetch('https://www.signaltradingbots.com/api/app/news');
    const newsData = await newsResponse.json();
    
    // Fetch Promotional Image
    const imageResponse = await fetch('https://www.signaltradingbots.com/api/app/promotional-image');
    const imageBlob = imageResponse.ok ? await imageResponse.blob() : null;
    const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : null;
    
    // Fetch Promotional Image Metadata
    const metadataResponse = await fetch('https://www.signaltradingbots.com/api/app/promotional-image/metadata');
    const metadata = metadataResponse.ok ? await metadataResponse.json() : null;
    
    // Use the data in your application
    // helpData.items - array of YouTube help items
    // newsData.items - array of news items
    // imageUrl - URL for the promotional image
    // metadata.redirectUrl - URL to redirect when promotional image is clicked
    
    return {
      youtubeHelp: helpData.items,
      news: newsData.items,
      promotionalImage: imageUrl,
      promotionalImageRedirectUrl: metadata?.redirectUrl || null
    };
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
}
```

---

## Admin Pages (For Content Management)

- **YouTube Help Admin:** `https://www.signaltradingbots.com/admin/youtube-help`
- **News Admin:** `https://www.signaltradingbots.com/admin/news`
- **Promotional Image Admin:** `https://www.signaltradingbots.com/admin/promotional-image`

These pages are for managing content only, not for the application to access.


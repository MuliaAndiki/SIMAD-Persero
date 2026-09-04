# Certificate Auto-Generation Feature

## Overview

The certificate auto-generation feature allows automatic generation of professional internship completion certificates in PDF format. The system generates certificates based on existing internship data without any data duplication.

## Architecture

### Backend Components

```
certificate/
├── config/certificate.template.config.ts  # Template configuration
├── services/certificate.service.ts        # Business logic
├── controllers/CertificateController.ts   # API handlers
├── utils/pdf.util.ts                      # PDF generation
└── routes/certificateRoutes.ts            # API endpoints
```

## Configuration System

### Template Configuration (`certificate.template.config.ts`)

All certificate layout settings are centralized in this configuration file:

```typescript
export const CERTIFICATE_CONFIG = {
  page: { width: 841.89, height: 595.28 },  // A4 Landscape
  title: { y: 450, fontSize: 32 },
  internName: { y: 360, fontSize: 26, maxWidth: 600 },
  // ... all positioning and styling
}
```

**To modify the certificate layout:**
1. Edit values in `CERTIFICATE_CONFIG`
2. No need to touch business logic
3. Changes apply to all new certificates

### Customizable Elements

- **Positioning**: All X/Y coordinates configurable
- **Typography**: Font sizes per element
- **Spacing**: Line heights and gaps
- **Alignment**: Center, left, or custom positioning
- **Max Width**: Auto-scaling for long text

## Data Mapping

The certificate pulls data from existing database relationships:

| Certificate Field | Database Source | Table Chain |
|------------------|-----------------|-------------|
| Intern Name | `user.fullName` | `Internship → InternProfile → User` |
| Student Number | `studentNumber` | `Internship → InternProfile` |
| Institution | `institution.name` | `Internship → InternProfile → Institution` |
| Department | `department.name` | `Internship → Department` |
| Start Date | `actualStartDate` | `Internship` |
| End Date | `actualEndDate` | `Internship` |
| City | `officeLocation.name` | `Internship → OfficeLocation` |
| Issue Date | `generatedAt` | `Certificate` |

**No data duplication** - all fields fetched via relations when generating PDF.

## PDF Generation

### Technology

- **Custom PDF Builder**: No external dependencies
- **Format**: A4 Landscape (841.89 x 595.28 pt)
- **Fonts**: Helvetica & Helvetica-Bold (PDF standard fonts)
- **Encoding**: Latin1 (supports Indonesian characters)

### Features

1. **Auto-Scaling**: Long names automatically scale down to fit
2. **Text Wrapping**: Ready for multi-line text if needed
3. **Custom Positioning**: Both centered and absolute positioning
4. **Template-Driven**: All styling from configuration

### Example Usage

```typescript
import { generateCertificatePdf } from '@/utils/pdf.util';

const pdfBuffer = generateCertificatePdf({
  certificateNumber: 'PLN-MAGANG-2026-000001',
  internName: 'John Doe',
  studentNumber: '1234567890',
  institutionName: 'Universitas Indonesia',
  departmentName: 'Teknologi Informasi',
  startDate: '1 Juni 2026',
  endDate: '31 Agustus 2026',
  verificationToken: 'abc123def456',
  cityName: 'Jakarta',
});

// pdfBuffer is ready to save or stream
```

## API Endpoints

All endpoints follow existing routes (`/api/v1/certificates`):

### 1. Generate Certificate (HR Admin)
```
POST /certificates/generate
Body: { internshipId: string }
```

**Business Rules:**
- Only `COMPLETED` internships can get certificates
- End date must be in the past
- One certificate per internship

### 2. Get My Certificate (Intern)
```
GET /certificates/me
```

Returns the intern's certificate (if exists).

### 3. Download Certificate
```
GET /certificates/:certificateId/download
```

Returns 302 redirect to R2 signed URL.

**Authorization:**
- Interns can only download their own
- HR Admin can download any

### 4. Regenerate Certificate (HR Admin)
```
POST /certificates/:certificateId/regenerate
```

Regenerates PDF with updated template (doesn't delete old file).

## Certificate Number Format

Format: `PLN-MAGANG-YYYY-NNNNNN`

Example: `PLN-MAGANG-2026-000001`

- `PLN-MAGANG`: Fixed prefix
- `YYYY`: Current year
- `NNNNNN`: Sequential number (6 digits, zero-padded)

## State Machine Integration

Certificate generation triggers internship status change:

```
COMPLETED → generate certificate → CERTIFICATE_GENERATED
```

This is logged in:
- `internship_status_histories` table
- `audit_logs` table

## Development

### Running Tests

```bash
# Run backend tests
bun test

# Type checking
bun run build
```

### Modifying Certificate Layout

1. Open `src/config/certificate.template.config.ts`
2. Adjust values (coordinates, font sizes, etc.)
3. Rebuild: `bun run build`
4. Test with real data

### Testing Certificate Generation

```typescript
// In your test file or manual script
import certificateService from '@/services/certificate.service';

// Generate for a completed internship
const cert = await certificateService.generate(
  userId,      // HR Admin user ID
  { internshipId: 'uuid-of-completed-internship' }
);

console.log('Certificate generated:', cert.certificateNumber);
console.log('Download URL:', cert.fileUrl);
```

## File Storage

Certificates are stored in R2/S3 via `FileService`:

- **Upload**: Automatic on generation
- **Storage**: R2 bucket (configured in env)
- **Access**: Signed URLs with expiration
- **Deletion**: Soft delete (keeps file for audit)

## Security

### Authorization Checks

1. **Generate**: Only HR_ADMIN role
2. **Download**: Owner (intern) or HR_ADMIN
3. **Regenerate**: Only HR_ADMIN
4. **Verify**: Public (no auth)

### Data Validation

- Internship must exist
- Status must be COMPLETED
- End date must be past
- No duplicate certificates

## Monitoring & Audit

Every certificate operation is logged:

```typescript
{
  module: 'CERTIFICATE',
  action: 'GENERATE' | 'REGENERATE',
  userId: '...',
  recordId: 'certificate-id',
  newData: { certificateNumber, templateId, ... }
}
```

Query audit logs:
```sql
SELECT * FROM audit_logs 
WHERE module = 'CERTIFICATE' 
ORDER BY created_at DESC;
```

## Troubleshooting

### Certificate Won't Generate

**Check:**
1. Internship status is `COMPLETED`
2. `actualEndDate` is in the past
3. No existing certificate for that internship
4. User has HR_ADMIN role

### PDF Looks Wrong

**Check:**
1. Template configuration values
2. Text auto-scaling settings
3. Browser PDF viewer vs Adobe Reader

### Download Fails

**Check:**
1. R2/S3 credentials in environment
2. File exists in database
3. User authorization (intern can only download own)

### Long Names Overflow

**Solution:**
Adjust in `certificate.template.config.ts`:

```typescript
internName: {
  maxWidth: 600,  // Increase if needed
  fontSize: 26,   // Decrease for longer names
}
```

Auto-scaling will handle it automatically.

## Future Enhancements

### Short Term
- [ ] Add logo image to PDF header
- [ ] Add signature image
- [ ] Add official stamp
- [ ] QR code for verification

### Medium Term
- [ ] Multiple template support
- [ ] Batch generation
- [ ] Email notification on generation
- [ ] Certificate preview (before download)

### Long Term
- [ ] Custom templates per department
- [ ] Certificate analytics dashboard
- [ ] Multi-language support
- [ ] Digital signature integration

## Support

For issues or questions:
1. Check this README
2. Review `CERTIFICATE_IMPLEMENTATION.md`
3. Check audit logs for errors
4. Contact backend team

---

**Last Updated:** 2026-09-02  
**Version:** 1.0.0  
**Status:** Production Ready ✅

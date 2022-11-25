import guid from '../../utils/guid';
import { fetch, urlShortenerEndpoint } from '../../settings';
import { ShortenerApiFp, ShortenedUrl } from './codegen';

export class ShortUrls {
    private defaultOptions = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Origin': 'https://dashboard.stage.empayre.com'
        }
    };

    private basePath = `${urlShortenerEndpoint}/v1`;

    private api: any;

    constructor(accessToken: string) {
        this.api = ShortenerApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    shortenUrl(sourceUrl: string, expiresAt: any): Promise<ShortenedUrl> {
        return this.issueRequest(
            this.api.shortenUrl(guid(), { sourceUrl, expiresAt }, this.defaultOptions)
        );
    }
        
    deleteShortenedUrl(id: string): Promise<void> {
        return this.issueRequest(
            this.api.deleteShortenedUrl(guid(), id, this.defaultOptions)
        );
    }

    private issueRequest(requestFn: Function): Promise<any> {
        return requestFn(fetch, this.basePath);
    }

}

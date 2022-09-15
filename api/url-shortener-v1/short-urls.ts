import * as chai from 'chai';
import guid from '../../utils/guid';
import { urlShortenerEndpoint } from '../../settings';
import { ShortenerApiFp, ShortenedUrl } from './codegen';

chai.should();

export class ShortUrls {
    private defaultOptions = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    private basePath = `${urlShortenerEndpoint}/v1`;

    private api;

    constructor(accessToken: string) {
        this.api = ShortenerApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    shortenUrl(sourceUrl: string, expiresAt: any): Promise<ShortenedUrl> {
        return this.api.shortenUrl(guid(), { sourceUrl, expiresAt }, this.defaultOptions)(
            undefined,
            this.basePath
        );
    }

    deleteShortenedUrl(id: string): Promise<void> {
        return this.api.deleteShortenedUrl(guid(), id, this.defaultOptions)(
            undefined,
            this.basePath
        );
    }
}

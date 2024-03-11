import CapSession from '@coremedia/studio-client.cap-rest-client/common/CapSession';
import RemoteBean from '@coremedia/studio-client.client-core/data/RemoteBean';
import { ServiceDescriptorWithProps } from "@coremedia/service-agent";
export declare function getSession(): Promise<CapSession>;
export declare function loadRemoteBean<T extends RemoteBean>(remoteBean: T): Promise<T>;
export declare function useService<T>(serviceDesc: ServiceDescriptorWithProps<T>): T | null;

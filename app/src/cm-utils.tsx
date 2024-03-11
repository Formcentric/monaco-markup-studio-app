import Cap from '@coremedia/studio-client.cap-rest-client/Cap'
import CapSession from '@coremedia/studio-client.cap-rest-client/common/CapSession'
import RemoteBean from '@coremedia/studio-client.client-core/data/RemoteBean'
import session from '@coremedia/studio-client.cap-rest-client/common/session'

import {serviceAgent, ServiceDescriptorWithProps} from "@coremedia/service-agent";
import {useEffect, useState} from "react";


const restApiPrefix = "/rest/api/";

export async function getSession(): Promise<CapSession> {
  return new Promise<CapSession>(resolve => {
    Cap.prepare(new URL(restApiPrefix, window.location.href).toString()).then(connection => {
      const loginService = connection.getLoginService()
      loginService.retrieveSession(newSession => {
        if (newSession) {
          resolve(newSession)
        }
      })
    })
  }).then(async s => {
    session._ = s
    await s.getConnection().setAutomaticInvalidations(true)
    return s
  })
}

export async function loadRemoteBean<T extends RemoteBean>(remoteBean: T): Promise<T> {
  return new Promise<T>(resolve => {
    remoteBean.load(resolve)
  })
}

export function useService<T>(serviceDesc: ServiceDescriptorWithProps<T>): T | null {
  const [service, setService] = useState<T | null>(null);

  useEffect(() => {
    const subscription = serviceAgent
            .observeServices<T>(serviceDesc, {fixed: false})
            .subscribe({
              next: (services) =>
                      setService((currentService: T | null) => {
                        if (currentService && services.length === 0) {
                          return null;
                        }
                        if (!currentService && services.length > 0) {
                          return services[0];
                        }
                        return currentService;
                      }),
              error: () => setService(null),
              complete: () => setService(null),
            });
    return () => subscription.unsubscribe();
  }, [serviceDesc]);

  return service;
}

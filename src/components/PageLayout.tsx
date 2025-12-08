import React, { useId } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonButtons,
} from "@ionic/react";

type PageLayoutProps = {
  title: string;
  children: React.ReactNode;
  /**
   * If true, replaces the content with a simple loading state.
   */
  loading?: boolean;
  loadingText?: string;
  /**
   * Optional className for the content area. Defaults to padded content to match current pages.
   */
  contentClassName?: string;
  /**
   * Legacy toolbar slot, kept for backwards compatibility.
   */
  headerSlot?: React.ReactNode;
  /**
   * Standard toolbar slots for start/end actions (e.g. filters, back buttons).
   */
  toolbarStart?: React.ReactNode;
  toolbarEnd?: React.ReactNode;
  /**
   * Pass through an id to IonPage (handy for routing targets or tests).
   */
  pageId?: string;
  /**
   * Toggle IonContent fullscreen to drop default padding when a screen needs full bleed.
   */
  fullscreen?: boolean;
  /**
   * Optional id to attach to the page title for accessibility.
   */
  titleId?: string;
  /**
   * Optional custom id to use for aria-labelledby (e.g. to point to a screen-reader-only heading).
   */
  ariaLabelledById?: string;
};

/**
 * Lightweight wrapper to keep page shells consistent across tabs (header, padding, loading state).
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  children,
  loading = false,
  loadingText = "Loading…",
  contentClassName = "ion-padding",
  headerSlot,
  toolbarStart,
  toolbarEnd,
  pageId,
  fullscreen = false,
  titleId,
  ariaLabelledById,
}) => {
  const generatedTitleId = useId();
  const resolvedTitleId = titleId ?? (pageId ? `${pageId}-title` : generatedTitleId);
  const labelledById = ariaLabelledById ?? resolvedTitleId;
  return (
    <IonPage id={pageId} aria-labelledby={labelledById}>
      <IonHeader>
        <IonToolbar>
          {toolbarStart && <IonButtons slot="start">{toolbarStart}</IonButtons>}
          <IonTitle
            id={resolvedTitleId}
            role="heading"
            aria-level={1}
            className="page-title-centered"
          >
            {title}
          </IonTitle>
          {toolbarEnd && <IonButtons slot="end">{toolbarEnd}</IonButtons>}
          {headerSlot}
        </IonToolbar>
      </IonHeader>

      <IonContent
        className={contentClassName}
        fullscreen={fullscreen}
        aria-labelledby={labelledById}
      >
        {loading ? <IonText>{loadingText}</IonText> : children}
      </IonContent>
    </IonPage>
  );
};

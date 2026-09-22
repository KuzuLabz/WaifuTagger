import { BottomSheetContentPadding, BottomSheetProps, SnapPoint } from "@expo/ui";
import { Column, ModalBottomSheet, ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import { fillMaxHeight, ModifierConfig, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useRef, useState } from "react";
import { useAppTheme } from "../../providers/theme";

export type ResolvedContentPadding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * Resolves the `contentPadding` prop against the inset the platform applies when the prop is
 * omitted. A number applies to every edge, and an edge left out of an object is `0`.
 */
export function resolveContentPadding(
  contentPadding: BottomSheetContentPadding | undefined,
  platformDefault: ResolvedContentPadding
): ResolvedContentPadding {
  if (contentPadding == null) {
    return platformDefault;
  }
  if (typeof contentPadding === 'number') {
    return {
      top: contentPadding,
      bottom: contentPadding,
      left: contentPadding,
      right: contentPadding,
    };
  }
  return {
    top: contentPadding.top ?? 0,
    bottom: contentPadding.bottom ?? 0,
    left: contentPadding.left ?? 0,
    right: contentPadding.right ?? 0,
  };
}

function shouldFillMaxHeight(snapPoints: SnapPoint[] | undefined): boolean {
  if (!snapPoints || snapPoints.length === 0) return false;
  return snapPoints.some(
    (sp) => sp === 'full' || (typeof sp === 'object' && 'fraction' in sp && sp.fraction >= 1)
  );
}

function shouldSkipPartiallyExpanded(snapPoints: SnapPoint[] | undefined): boolean {
  if (!snapPoints || snapPoints.length === 0) return false;
  return !snapPoints.some(
    (sp) =>
      sp === 'half' ||
      (typeof sp === 'object' && 'fraction' in sp && sp.fraction < 1) ||
      (typeof sp === 'object' && 'height' in sp)
  );
}

export const BottomSheet = ({isPresented, showDragIndicator, contentPadding, snapPoints, modifiers, children, shouldDismissOnBackPress, onDismiss}: BottomSheetProps) => {
    const sheetRef = useRef<ModalBottomSheetRef>(null);
    const [mount, setMount] = useState(isPresented);
    const { colors } = useAppTheme();

    useEffect(() => {
        if (isPresented) {
            setMount(true);
            return;
        }
        let cancelled = false;
        sheetRef.current?.hide().then(() => {
        if (!cancelled) setMount(false);
        });
        return () => {
        cancelled = true;
        };
    }, [isPresented]);

    if (!mount) {
        return null;
    }

    const { top, bottom, left, right } = resolveContentPadding(contentPadding, {
        top: showDragIndicator ? 0 : 16,
        bottom: 0,
        left: 12,
        right: 12,
    });
  const contentModifiers: ModifierConfig[] = [padding(left, top, right, bottom)];
  if (shouldFillMaxHeight(snapPoints)) contentModifiers.push(fillMaxHeight());

    return(
        <ModalBottomSheet 
            ref={sheetRef}
            onDismissRequest={onDismiss}
            showDragHandle={showDragIndicator}
            skipPartiallyExpanded={shouldSkipPartiallyExpanded(snapPoints)}
            properties={{ shouldDismissOnBackPress }}
            modifiers={modifiers}
            containerColor={colors.surfaceContainerLow}
        >
            <Column modifiers={contentModifiers}>{children}</Column>
        </ModalBottomSheet>
    );
};
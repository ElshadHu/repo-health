"use client";

import { Box, Text, Button, Flex } from "@chakra-ui/react";
import { createToaster, Toaster } from "@chakra-ui/react";
import { X, Info } from "lucide-react";
import type { ReactNode } from "react";

// Toast configuration
export const toaster = createToaster({
  placement: "top",
  duration: 3000,
  max: 3,
});

// Toast type configuration
const toastConfig = {
  error: {
    bg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    icon: X,
    iconBg: "rgba(255,255,255,0.2)",
  },
  info: {
    bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    icon: Info,
    iconBg: "rgba(255,255,255,0.2)",
  },
};

type ToastType = keyof typeof toastConfig;

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastData {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  type?: ToastType | string;
  action?: ToastAction;
}

// Custom Toast Component
function CustomToast({ toast }: { toast: ToastData }) {
  const type = (toast.type as ToastType) || "info";
  const config = toastConfig[type] || toastConfig.info;
  const isSignInAction = toast.action?.label?.toLowerCase().includes("sign");

  return (
    <Box
      position="relative"
      css={{
        animation: "slideIn 0.3s ease-out",
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateY(-20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Arrow pointer for sign-in guidance */}
      {isSignInAction && (
        <Box
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          top="-10px"
          width={0}
          height={0}
          borderLeft="10px solid transparent"
          borderRight="10px solid transparent"
          borderBottom="10px solid rgba(0,0,0,0.8)"
          zIndex={10}
        />
      )}

      <Box
        bg={config.bg}
        color="white"
        p={4}
        borderRadius="xl"
        boxShadow="0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)"
        overflow="hidden"
        minW="320px"
        maxW="420px"
        backdropFilter="blur(10px)"
      >
        <Flex gap={3} alignItems="flex-start">
          {/* Icon */}
          <Flex
            w="28px"
            h="28px"
            borderRadius="full"
            bg={config.iconBg}
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <config.icon size={16} strokeWidth={2.5} />
          </Flex>

          {/* Content */}
          <Box flex="1" minW={0}>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="short">
              {toast.title}
            </Text>
            {toast.description && (
              <Text
                fontSize="xs"
                opacity={0.9}
                mt={1}
                lineHeight="short"
                wordBreak="break-word"
              >
                {toast.description}
              </Text>
            )}
          </Box>

          {/* Action Button */}
          {toast.action && (
            <Button
              size="xs"
              bg="rgba(255,255,255,0.2)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.3)" }}
              _active={{ bg: "rgba(255,255,255,0.4)" }}
              onClick={toast.action.onClick}
              fontWeight="semibold"
              borderRadius="md"
              px={3}
              flexShrink={0}
            >
              {toast.action.label}
            </Button>
          )}

          {/* Close Button */}
          <Button
            size="xs"
            variant="ghost"
            color="white"
            opacity={0.7}
            _hover={{ opacity: 1, bg: "rgba(255,255,255,0.1)" }}
            onClick={() => toaster.dismiss(toast.id)}
            minW="auto"
            h="auto"
            p={1}
            borderRadius="full"
            aria-label="Dismiss notification"
          >
            ✕
          </Button>
        </Flex>

        {/* Progress Bar */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          height="3px"
          bg="rgba(255,255,255,0.4)"
          borderRadius="0 0 0 xl"
          css={{
            animation: "shrink 3000ms linear forwards",
            "@keyframes shrink": {
              from: { width: "100%" },
              to: { width: "0%" },
            },
          }}
        />
      </Box>
    </Box>
  );
}

export function ToastContainer() {
  return (
    <Toaster toaster={toaster}>
      {(toast) => <CustomToast toast={toast as ToastData} />}
    </Toaster>
  );
}

export const showToast = {
  error: (title: string, description?: string, action?: ToastAction) => {
    return toaster.create({ title, description, type: "error", action });
  },
  info: (title: string, description?: string, action?: ToastAction) => {
    return toaster.create({ title, description, type: "info", action });
  },
};

export default ToastContainer;

import { useState } from "react"

import { useAppConfig } from "@/contexts"
import { usePinoramaIntrospection } from "@/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormattedMessage } from "react-intl"
import { z } from "zod"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

import { cn } from "@/lib/utils"
import style from "./connection-status.module.css"

const formSchema = z.object({
  connectionUrl: z.string().url("Invalid URL")
})

export function ConnectionStatus() {
  const appConfig = useAppConfig()
  const { status, fetchStatus } = usePinoramaIntrospection()

  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionUrl: appConfig?.config.connectionUrl || ""
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    appConfig?.setConfig({
      ...appConfig.config,
      connectionUrl: values.connectionUrl
    })

    setOpen(false)
  }

  let derivedStatus = ""

  const connectionStatus = appConfig?.config.connectionStatus

  switch (true) {
    case connectionStatus === "disconnected":
      derivedStatus = "disconnected"
      break
    case status === "pending" && fetchStatus === "fetching":
      derivedStatus = "connecting"
      break
    case status === "success":
      derivedStatus = "connected"
      break
    case status === "error":
      derivedStatus = "connectionFailed"
      break
    default:
      derivedStatus = "unknown"
      break
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={style.popoverTrigger}>
          <div className={cn(style.statusIndicator, style[derivedStatus])} />
          <span className="">
            <FormattedMessage id={`connectionStatus.${derivedStatus}`} />
          </span>
          <span className="text-muted-foreground">
            {appConfig?.config.connectionUrl ?? "Unknown"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="connectionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="server.url" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={style.buttonsContainer}>
              <Button
                type="button"
                variant="outline"
                disabled={!form.formState.isDirty}
                onClick={() => form.reset()}
                className="w-full"
              >
                <FormattedMessage id="actions.reset" />
              </Button>
              <Button type="submit" className="w-full">
                <FormattedMessage id="actions.save" />
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}

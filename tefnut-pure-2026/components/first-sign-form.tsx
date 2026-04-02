// 首次登录
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, type TextInput, View } from 'react-native';

type FirstSignInFormProps = {
  onSubmit: () => void;
};

export function FirstSignInForm({ onSubmit }: FirstSignInFormProps) {
  const passwordInputRef = React.useRef<TextInput>(null);
  const userNameInputRef = React.useRef<TextInput>(null);

  function onUserNameSubmitEditing() {
    passwordInputRef.current?.focus();
  }
  function onIpSubmitEditing() {
    userNameInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-left text-xl">登录QBittorrent</CardTitle>
          <CardDescription className="text-left">
            首次使用tefnut需先于QBittorent建立连接
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="IP">IP</Label>
              <Input
                id="ip"
                placeholder="http://xxx.xxx.xxx.xxx:xxxx"
                keyboardType="url"
                autoComplete="url"
                autoCapitalize="none"
                onSubmitEditing={onIpSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            <View className="gap-1.5">
              <Label htmlFor="IP">UserName</Label>
              <Input
                ref={userNameInputRef}
                id="userName"
                placeholder="user"
                keyboardType="default"
                autoComplete="name"
                autoCapitalize="none"
                onSubmitEditing={onUserNameSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
            </View>
            <Button className="w-full" onPress={onSubmit}>
              <Text>登录</Text>
            </Button>
          </View>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">tefnut</Text>
            <Separator className="flex-1" />
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
